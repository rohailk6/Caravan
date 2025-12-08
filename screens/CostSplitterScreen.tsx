import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Define TypeScript Interfaces for data structures
interface Passenger {
    id: string;
    name: string;
    stopIndex: number;
    positionKm: number;
}

interface NearbyPassenger extends Passenger {
    metersFromPoint: number;
}

interface ChosenPassenger {
    id: string;
    name: string;
    positionKm: number;
}

interface PassengerDetail extends ChosenPassenger {
    pickupOffsetKm: number;
    pickupAbsKm: number;
    distanceToEndKm: number;
    timeMin: number;
    metersFromDriver: number;
}

interface Share {
    id: string; // "driver" or passenger ID
    name: string;
    share: number; // Rounded fare amount
}

interface SummaryOutput {
    routeKm: number;
    extraPickupKm: number;
    driverKm: number;
    driverTimeMin: number;
    passengers: PassengerDetail[];
    shares: Share[];
    totalCost: number;
}

// Put your image in ./assets/Carvaan.png
// NOTE: You must ensure this path is correct for your project structure.
const logo = require("../logo.png");

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

/* ------------------------ Static data ------------------------ */
const STOPS: string[] = [
    "Chamkani Chowk",
    "Chughal Pura",
    "Dr Zareef Memorial School",
    "Sethi Town",
    "Sikandar Town",
    "Gulbahar Square",
    "Hashtnagri (Qila Bala Hisar)",
    "Qila Balahisar",
    "Hospital Road",
    "Khyber Bazaar",
    "Soekarno Square / Secretariat",
    "Dabgari Gardens",
    "Railway Station",
    "State Bank of Pakistan",
    "Saddar Bazar",
    "Mall Road",
    "Khyber Road / Airport area",
    "Gora Qabristan",
    "Tehkal",
    "Tambuwaan",
    "Abdara Road",
    "University Town",
    "KTH (University of Peshawar)",
    "Islamia College",
    "Board Bazar Regi",
    "Taj Abad",
    "Hayatabad Model School",
    "Hayatabad Phase 3",
    "Tatara Park",
    "PDA Hayatabad",
    "Cancer Hospital",
];

const DISTANCES: number[] = [
    1.62, 1.4, 0.655, 0.66, 0.915, 0.79, 0.53, 0.7, 0.59, 0.55, 0.64, 0.55, 1.05,
    0.62, 0.84, 0.69, 1.27, 0.78, 0.78, 0.8, 0.79, 0.76, 0.85, 0.73, 1.25, 0.92,
    0.67, 1.45, 0.63, 0.68,
];

// Helper: build cumulative distance from route start to each stop
function getCumulative(distances: number[]): number[] {
    const cum: number[] = [0];
    for (let i = 0; i < distances.length; i++) cum.push(Number((cum[i] + distances[i]).toFixed(6)));
    return cum;
}
const CUMULATIVE: number[] = getCumulative(DISTANCES);

/* ------------------------ Mock passengers --------------------- */
const NAMES: string[] = [
    "Aisha","Bilal","Faisal","Hina","Kamal","Laila","Naveed","Salma","Usman","Zara",
    "Mubashir","Sara","Omer","Rabia","Tariq","Imran","Sana","Yasir","Amna","Farhan",
    "Rida","Adnan","Areeba","Zubair","Daniyal","Huma","Feroze","Nida","Hamza","Mona"
];

// create mock passenger objects with approximate position (km along route)
function buildMockPassengers(): Passenger[] {
    return NAMES.map((name, i) => {
        const stopIndex = i % STOPS.length;
        const offset = ((i * 53) % 91) / 200 - 0.225; // small +/- offset
        return {
            id: `p${i + 1}`,
            name,
            stopIndex,
            positionKm: Number(Math.max(0, CUMULATIVE[stopIndex] + offset).toFixed(3)),
        };
    });
}
const MOCK_PASSENGERS: Passenger[] = buildMockPassengers();

/* ---------------------- Simple utilities --------------------- */
// Find passengers within radiusKm of a point (in km)
function findNearbyPassengers(pointKm: number, radiusKm: number = 1): NearbyPassenger[] {
    const low = pointKm - radiusKm;
    const high = pointKm + radiusKm;
    return MOCK_PASSENGERS
        .filter((p) => p.positionKm >= low && p.positionKm <= high)
        .map((p) => ({ ...p, metersFromPoint: Math.round(Math.abs(p.positionKm - pointKm) * 1000) }))
        .sort((a, b) => a.metersFromPoint - b.metersFromPoint);
}

/* ------------------------ Main component --------------------- */
const CostSplitterScreen = () => {
    // constants & state
    const minutesPerKm: number = 2; // simple speed model: 30km/h -> 2 min/km
    const [baseFare, setBaseFare] = useState<number>(500);
    const [startIdx, setStartIdx] = useState<number>(0);
    const [endIdx, setEndIdx] = useState<number>(STOPS.length - 1);
    const [nearby, setNearby] = useState<NearbyPassenger[]>([]);      
    const [chosen, setChosen] = useState<ChosenPassenger[]>([]);      
    const [showStartModal, setShowStartModal] = useState<boolean>(false);
    const [showEndModal, setShowEndModal] = useState<boolean>(false);
    const [showSummary, setShowSummary] = useState<boolean>(false);

    // UI helpers to change fare in fixed steps
    const decFare = (): void => setBaseFare((v) => Math.max(0, v - 50));
    const incFare = (): void => setBaseFare((v) => v + 50);

    // find passengers strictly within 1 km of driver start
    const handleFindNearby = (): void => {
        const startKm = CUMULATIVE[startIdx];
        const found = findNearbyPassengers(startKm, 1.0);
        setNearby(found);
    };

    // toggle passenger selection (enforce max 3)
    const togglePassenger = (id: string): void => {
        if (chosen.some((c) => c.id === id)) {
            setChosen((c) => c.filter((x) => x.id !== id));
            return;
        }
        if (chosen.length >= 3) return;
        const p = nearby.find((x) => x.id === id);
        if (p) setChosen((c) => [...c, { id: p.id, name: p.name, positionKm: p.positionKm }]);
    };

    /* ------------- Core: compute summary ------------- */
    const computeSummary = (): SummaryOutput => {
        const startKm = CUMULATIVE[startIdx];
        const endKm = CUMULATIVE[endIdx];
        const routeKm = Number(Math.abs(endKm - startKm).toFixed(6));

        // pickup offsets are simple absolute difference between passenger and driver start
        const pickupOffsets: number[] = chosen.map((p) => Math.abs(p.positionKm - startKm));
        const extraPickupKm = Number(pickupOffsets.reduce((s, x) => s + x, 0).toFixed(6));

        // driver total = route distance + sum of pickup offsets
        const driverKm = Number((routeKm + extraPickupKm).toFixed(6));
        const driverTimeMin = Number((driverKm * minutesPerKm).toFixed(2));

        // passenger details: clamp pickup point to route segment, compute distance from pickup -> end
        const passengerDetails: PassengerDetail[] = chosen.map((p) => {
            const segA = Math.min(startKm, endKm);
            const segB = Math.max(startKm, endKm);
            let pickupAbs = p.positionKm;
            if (pickupAbs < segA) pickupAbs = segA;
            if (pickupAbs > segB) pickupAbs = segB;

            const distPickupToEnd = Number(Math.abs(endKm - pickupAbs).toFixed(6));
            const timeMin = Number((distPickupToEnd * minutesPerKm).toFixed(2));
            const metersFromDriver = Math.round(Math.abs(p.positionKm - startKm) * 1000);

            return {
                id: p.id,
                name: p.name,
                positionKm: p.positionKm,
                pickupOffsetKm: Number(Math.abs(p.positionKm - startKm).toFixed(6)),
                pickupAbsKm: Number(pickupAbs.toFixed(6)),
                distanceToEndKm: distPickupToEnd,
                timeMin,
                metersFromDriver,
            };
        });

        // participants array includes driver (as first item) and passengers
        const driverParticipant = { id: "driver", name: "Driver", timeMin: driverTimeMin, distanceToEndKm: routeKm };
        const participants = [driverParticipant, ...passengerDetails];

        // fare split proportional to travel time
        const totalTime = participants.reduce((s, x) => s + x.timeMin, 0) || 1;
        let shares: Share[] = participants.map((p) => {
            const raw = (p.timeMin / totalTime) * baseFare;
            return { id: p.id === "driver" ? "driver" : p.id, name: p.name, share: Math.round(raw) };
        });

        // adjust rounding difference on driver so sum equals baseFare
        const sumShares = shares.reduce((s, x) => s + x.share, 0);
        const diff = baseFare - sumShares;
        if (diff !== 0) {
            const idx = shares.findIndex((s) => s.id === "driver");
            if (idx >= 0) shares[idx].share += diff;
        }

        const totalCost = shares.reduce((s, x) => s + x.share, 0);

        return {
            routeKm,
            extraPickupKm,
            driverKm,
            driverTimeMin,
            passengers: passengerDetails,
            shares,
            totalCost,
        };
    };

    // memoize summary so UI re-renders don't recompute unnecessarily
    const summary: SummaryOutput = useMemo(() => computeSummary(), [baseFare, startIdx, endIdx, chosen]);

    /* ---------------------- Small UI helpers --------------------- */
    interface LocationModalProps {
        visible: boolean;
        onClose: () => void;
        onSelect: (index: number) => void;
    }

    function LocationModal({ visible, onClose, onSelect }: LocationModalProps) {
        return (
            <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
                <SafeAreaView style={modalStyles.modalSafe}>
                    <View style={modalStyles.modalHeader}>
                        <Text style={modalStyles.modalTitle}>Select Location</Text>
                        <TouchableOpacity onPress={onClose} style={modalStyles.modalClose}>
                            <Text style={{ color: "#fff" }}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={STOPS}
                        keyExtractor={(_item, idx) => String(idx)}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                style={modalStyles.locationRow}
                                onPress={() => {
                                    onSelect(index);
                                    onClose();
                                }}
                            >
                                <Text style={modalStyles.locationText}>{item}</Text>
                                <Text style={modalStyles.locationKm}>{CUMULATIVE[index].toFixed(3)} km</Text>
                            </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#eef2f7" }} />}
                    />
                </SafeAreaView>
            </Modal>
        );
    }

    /* --------------------------- RENDER -------------------------- */
    if (showSummary) {
        const { routeKm, extraPickupKm, driverKm, driverTimeMin, passengers, shares, totalCost } = summary;
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.container}>
                    <View style={styles.top}>
                        <Image source={logo} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.headerSmall}>Journey Summary</Text>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>{STOPS[startIdx]} → {STOPS[endIdx]}</Text>
                            <Text style={styles.summarySub}>Route: {routeKm.toFixed(3)} km</Text>
                            <Text style={styles.summarySub}>Pickup extra (sum): {extraPickupKm.toFixed(3)} km</Text>
                            <Text style={[styles.summarySub, { fontWeight: "800", marginTop: 6 }]}>Driver total: {driverKm.toFixed(3)} km</Text>
                            <Text style={styles.summarySub}>Driver ETA: {Math.round(driverTimeMin)} min</Text>
                            <Text style={[styles.summarySub, { marginTop: 8, fontWeight: "900" }]}>Total cost: PKR {totalCost.toLocaleString("en-US")}</Text>
                        </View>

                        <View style={{ marginTop: 14 }}>
                            <Text style={styles.sectionTitle}>Passengers details</Text>
                            {passengers.length === 0 ? (
                                <Text style={{ color: "#64748b", marginTop: 8 }}>No passengers were chosen.</Text>
                            ) : (
                                passengers.map((p) => (
                                    <View key={p.id} style={styles.passengerRowLarge}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.passName}>{p.name}</Text>
                                            <Text style={styles.passMeta}>Pickup is {p.metersFromDriver} m from driver start</Text>
                                            <Text style={styles.passMeta}>Distance pickup→end: {p.distanceToEndKm.toFixed(3)} km</Text>
                                            <Text style={styles.passMeta}>ETA (passenger): {Math.round(p.timeMin)} min</Text>
                                        </View>
                                    </View>
                                ))
                            )}

                            <View style={{ height: 12 }} />
                            <Text style={[styles.sectionTitle, { marginLeft: 12 }]}>Fare shares</Text>
                            {shares.map((s) => (
                                <View key={s.id} style={[styles.passengerRowLarge, { justifyContent: "space-between" }]}>
                                    <Text style={styles.passName}>{s.id === "driver" ? "Driver" : s.name}</Text>
                                    <Text style={styles.passCost}>PKR {s.share.toLocaleString("en-US")}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={{ height: 20 }} />
                        <TouchableOpacity onPress={() => setShowSummary(false)} style={{ marginHorizontal: 12 }}>
                            <View style={[styles.primaryButton, { backgroundColor: "#319BFE" }]}>
                                <Text style={styles.primaryButtonText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }

    // Main screen
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.top}>
                    <Image source={logo} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.headerSmall}>Choose start & end, pick nearby passengers, start journey</Text>
                </View>

                <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 160 }}>
                    {/* Driver start */}
                    <View style={styles.rowCard}>
                        <Text style={styles.rowLabel}>Driver Start</Text>
                        <TouchableOpacity onPress={() => setShowStartModal(true)} style={styles.rowSelect}>
                            <Text style={styles.rowSelectText}>{STOPS[startIdx]}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Driver end */}
                    <View style={styles.rowCard}>
                        <Text style={styles.rowLabel}>Driver End</Text>
                        <TouchableOpacity onPress={() => setShowEndModal(true)} style={styles.rowSelect}>
                            <Text style={styles.rowSelectText}>{STOPS[endIdx]}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Base fare control */}
                    <View style={styles.rowCard}>
                        <Text style={styles.rowLabel}>Driver Base Fare (PKR)</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                            <TouchableOpacity onPress={decFare} style={[styles.fareBtn, { backgroundColor: "#319BFE" }]}>
                                <Text style={[styles.fareBtnText, { color: "#fff" }]}>-</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={styles.fareInput}
                                keyboardType="numeric"
                                value={String(baseFare)}
                                onChangeText={(t) => {
                                    const n = Number(t.replace(/[^0-9]/g, "")) || 0;
                                    setBaseFare(n);
                                }}
                            />
                            <TouchableOpacity onPress={incFare} style={[styles.fareBtn, { backgroundColor: "#319BFE" }]}>
                                <Text style={[styles.fareBtnText, { color: "#fff" }]}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ marginTop: 8, color: "#64748b" }}>Tap + / - to adjust base fare in steps of 50 PKR</Text>
                    </View>

                    {/* Find nearby */}
                    <View style={{ marginTop: 8 }}>
                        <TouchableOpacity onPress={handleFindNearby} style={{ marginHorizontal: 12 }}>
                            <View style={[styles.primaryButton, { backgroundColor: "#319BFE" }]}>
                                <Text style={styles.primaryButtonText}>Find passengers near start (1 km)</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Available passengers */}
                    <View style={{ marginTop: 12 }}>
                        <Text style={styles.sectionTitle}>Available passengers near start</Text>
                        {nearby.length === 0 ? (
                            <Text style={{ color: "#64748b", marginTop: 8 }}>No passengers found within 1 km of start. Tap "Find passengers".</Text>
                        ) : (
                            nearby.map((p) => {
                                const isChosen = chosen.some((c) => c.id === p.id);
                                return (
                                    <TouchableOpacity
                                        key={p.id}
                                        onPress={() => togglePassenger(p.id)}
                                        style={[styles.passengerRow, { backgroundColor: isChosen ? "#ecfeff" : "#fff" }]}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.passName}>{p.name}</Text>
                                            <Text style={styles.passMeta}>near {STOPS[p.stopIndex]} • {p.positionKm} km</Text>
                                        </View>
                                        <View style={{ alignItems: "flex-end" }}>
                                            <Text style={{ fontWeight: "700", color: isChosen ? "#0ea5a4" : "#64748b" }}>
                                                {isChosen ? "Selected" : "Select"}
                                            </Text>
                                            <Text style={{ color: "#475569", marginTop: 6 }}>{p.metersFromPoint} m</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>

                    {/* Chosen passengers */}
                    <View style={{ marginTop: 12 }}>
                        <Text style={styles.sectionTitle}>Chosen passengers ({chosen.length}/3)</Text>
                        {chosen.length === 0 ? <Text style={{ color: "#64748b", marginTop: 8 }}>No passengers chosen.</Text> : null}
                        {chosen.map((p) => (
                            <View key={p.id} style={[styles.passengerRow, { backgroundColor: "#6BB7FF", marginHorizontal: 12 }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.passName, { color: "#fff" }]}>{p.name}</Text>
                                    <Text style={[styles.passMeta, { color: "#f0fbff" }]}>pos {p.positionKm} km</Text>
                                </View>
                                <TouchableOpacity onPress={() => setChosen((c) => c.filter((x) => x.id !== p.id))}>
                                    <Text style={{ color: "#fff", fontWeight: "700" }}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* Start Journey button moved up a bit to avoid nav overlap */}
                <View style={[styles.bottom, { bottom: 84 }]}>
                    <TouchableOpacity onPress={() => setShowSummary(true)} style={{ marginHorizontal: 12 }}>
                        <View style={[styles.primaryButton, { backgroundColor: "#319BFE" }]}>
                            <Text style={styles.primaryButtonText}>Start Journey • Calculate Cost</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <LocationModal visible={showStartModal} onClose={() => setShowStartModal(false)} onSelect={(idx) => setStartIdx(idx)} />
                <LocationModal visible={showEndModal} onClose={() => setShowEndModal(false)} onSelect={(idx) => setEndIdx(idx)} />
            </View>
        </SafeAreaView>
    );
}

export default CostSplitterScreen;

/* -------------------------- Styles -------------------------- */
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "white" },
    container: { flex: 1, paddingTop: 8 },
    top: { alignItems: "center", paddingVertical: 12 },
    logo: { width: SCREEN_W * 0.45, height: SCREEN_H * 0.11 },
    headerSmall: { marginTop: 8, color: "#334155", fontSize: 13 },

    rowCard: { backgroundColor: "#fff", marginHorizontal: 12, marginTop: 10, padding: 12, borderRadius: 12, elevation: 2 },
    rowLabel: { color: "#0f172a", fontWeight: "700", marginBottom: 8 },
    rowSelect: { backgroundColor: "#f1f5f9", padding: 12, borderRadius: 8 },
    rowSelectText: { color: "#0f172a", fontWeight: "700" },

    fareBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginRight: 8 },
    fareBtnText: { fontSize: 18, fontWeight: "800" },
    fareInput: { flex: 1, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 8, textAlign: "center", fontWeight: "700" },

    primaryButton: { borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center", elevation: 2 },
    primaryButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },

    passengerRow: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginTop: 8, marginHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 1 },
    passName: { fontWeight: "800", color: "#04293a" },
    passMeta: { color: "#475569", marginTop: 4, fontSize: 12 },
    passCost: { fontWeight: "800", color: "#0f172a" },

    passengerRowLarge: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginTop: 10, elevation: 2, flexDirection: "row", alignItems: "flex-start" },

    sectionTitle: { marginLeft: 12, marginTop: 8, fontWeight: "800", color: "#06283d" },

    bottom: { position: "absolute", left: 0, right: 0, paddingHorizontal: 12 },
    startBtn: { backgroundColor: "#0f172a", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
    startBtnText: { color: "white", fontWeight: "900", fontSize: 16 },

    summaryCard: { backgroundColor: "#fff", padding: 12, borderRadius: 12, elevation: 2 },
    summaryTitle: { fontWeight: "900", fontSize: 18 },
    summarySub: { marginTop: 6, color: "#475569" },

    secondaryBtn: { marginTop: 24, backgroundColor: "#f1f5f9", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    secondaryBtnText: { color: "#0f172a", fontWeight: "800" },
});

/* ---------------- Modal styles ---------------- */
const modalStyles = StyleSheet.create({
    modalSafe: { flex: 1, backgroundColor: "#E4F2FF" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#0f172a" },
    modalTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
    modalClose: { backgroundColor: "#0ea5a4", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
    locationRow: { padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    locationText: { fontWeight: "700", color: "#022c43" },
    locationKm: { color: "#64748b" },
});