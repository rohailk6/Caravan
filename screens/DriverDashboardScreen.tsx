import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { acceptBooking, getBookingRequests, getMyRides, rejectBooking } from "../api";

const DriverDashboardScreen = () => {
    const router = useRouter();

    const logoSource = require("../logo.png");
    const carImageSource = require("../drivercar1.png");

    // ── STATE ─────────────────────────────────────────────────
    const [rides, setRides] = useState([]);
    const [bookingRequests, setBookingRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'rides' | 'requests'>('rides');

    // ── FETCH DATA ────────────────────────────────────────────
    const fetchData = async () => {
        setLoading(true);
        try {
            // Get driver's rides and booking requests at the same time
            const [ridesResponse, requestsResponse] = await Promise.all([
                getMyRides(),
                getBookingRequests(),
            ]);
            setRides(ridesResponse.rides || []);
            setBookingRequests(requestsResponse.requests || []);
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.response?.data?.detail || "Could not load data."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Refresh when screen comes into focus
    // This means every time driver navigates back here, data reloads
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // ── ACCEPT / REJECT BOOKING ───────────────────────────────
    const handleAccept = async (bookingId: string) => {
        try {
            await acceptBooking(bookingId);
            Alert.alert("✅ Accepted", "Booking has been accepted!");
            fetchData(); // refresh data
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.detail || "Could not accept booking.");
        }
    };

    const handleReject = async (bookingId: string) => {
        try {
            await rejectBooking(bookingId);
            Alert.alert("Rejected", "Booking has been rejected.");
            fetchData(); // refresh data
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.detail || "Could not reject booking.");
        }
    };

    // ── RENDER RIDE CARD ──────────────────────────────────────
    const renderRideCard = ({ item }: { item: any }) => (
        <View style={styles.rideCard}>
            <View style={styles.rideCardHeader}>
                <View style={styles.rideStatusBadge}>
                    <Text style={styles.rideStatusText}>{item.status?.toUpperCase()}</Text>
                </View>
                <Text style={styles.rideDate}>{item.ride_date} • {item.ride_time}</Text>
            </View>

            <View style={styles.rideRoute}>
                <View style={styles.routePoint}>
                    <Ionicons name="radio-button-on" size={16} color="#4D9EFF" />
                    <Text style={styles.routeText} numberOfLines={1}>
                        {item.start_location?.name || "Start"}
                    </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                    <Ionicons name="location" size={16} color="#FF6B6B" />
                    <Text style={styles.routeText} numberOfLines={1}>
                        {item.end_location?.name || "End"}
                    </Text>
                </View>
            </View>

            <View style={styles.rideCardFooter}>
                <View style={styles.rideInfo}>
                    <Ionicons name="people" size={16} color="#718096" />
                    <Text style={styles.rideInfoText}>
                        {item.booked_seats}/{item.available_seats} seats booked
                    </Text>
                </View>
                <View style={styles.rideInfo}>
                    <Ionicons name="cash" size={16} color="#718096" />
                    <Text style={styles.rideInfoText}>PKR {item.price_per_seat}/seat</Text>
                </View>
            </View>
        </View>
    );

    // ── RENDER BOOKING REQUEST CARD ───────────────────────────
    const renderRequestCard = ({ item }: { item: any }) => (
        <View style={styles.requestCard}>
            <View style={styles.requestInfo}>
                <Ionicons name="person-circle" size={40} color="#4D9EFF" />
                <View style={styles.requestDetails}>
                    <Text style={styles.requestName}>{item.rider_name}</Text>
                    <Text style={styles.requestSeats}>
                        Requesting {item.seats_requested} seat(s)
                    </Text>
                </View>
            </View>

            <View style={styles.requestButtons}>
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(item.id)}
                >
                    <Text style={styles.acceptText}>✓ Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(item.id)}
                >
                    <Text style={styles.rejectText}>✗ Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.logoContainer}>
                    <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
                </View>

                <View style={styles.menuSpacer} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Car Image + Question */}
                <View style={styles.content}>
                    <View style={styles.carContainer}>
                        <Image source={carImageSource} style={styles.carImage} resizeMode="contain" />
                    </View>
                    <Text style={styles.questionText}>Do you want to post a ride?</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.postRideButton}
                        onPress={() => router.push('/postRideVehicle')}
                    >
                        <Text style={styles.buttonText}>POST A RIDE</Text>
                    </TouchableOpacity>
                </View>

                {/* ── TABS ─────────────────────────────────────── */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'rides' && styles.activeTab]}
                        onPress={() => setActiveTab('rides')}
                    >
                        <Text style={[styles.tabText, activeTab === 'rides' && styles.activeTabText]}>
                            My Rides ({rides.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                        onPress={() => setActiveTab('requests')}
                    >
                        <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                            Requests ({bookingRequests.length})
                        </Text>
                        {/* Red dot if there are pending requests */}
                        {bookingRequests.length > 0 && (
                            <View style={styles.badgeDot} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* ── CONTENT BASED ON TAB ─────────────────────── */}
                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color="#4D9EFF"
                        style={{ marginTop: 30 }}
                    />
                ) : activeTab === 'rides' ? (
                    <View style={styles.listContainer}>
                        {rides.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="car-outline" size={60} color="#CBD5E0" />
                                <Text style={styles.emptyText}>No rides posted yet</Text>
                                <Text style={styles.emptySubText}>
                                    Tap "POST A RIDE" to get started!
                                </Text>
                            </View>
                        ) : (
                            rides.map((ride: any) => (
                                <View key={ride.id}>
                                    {renderRideCard({ item: ride })}
                                </View>
                            ))
                        )}
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {bookingRequests.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={60} color="#CBD5E0" />
                                <Text style={styles.emptyText}>No pending requests</Text>
                                <Text style={styles.emptySubText}>
                                    Booking requests will appear here
                                </Text>
                            </View>
                        ) : (
                            bookingRequests.map((request: any) => (
                                <View key={request.id}>
                                    {renderRequestCard({ item: request })}
                                </View>
                            ))
                        )}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

export default DriverDashboardScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingTop: 60 },
    header: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", paddingHorizontal: 15, marginBottom: 20,
    },
    backButton: { flexDirection: "row", alignItems: "center" },
    backText: { marginLeft: 4, fontSize: 16, color: "#000" },
    logoContainer: {
        flex: 1, alignItems: "center", justifyContent: "center",
        position: 'absolute', left: 0, right: 0,
    },
    logoImage: { width: 140, height: 40 },
    menuSpacer: { width: 60 },
    content: { alignItems: "center", paddingHorizontal: 20 },
    carContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 20, width: '100%' },
    carImage: { width: '90%', height: 150 },
    questionText: { fontSize: 26, fontWeight: "500", textAlign: "center", color: "#333", lineHeight: 36 },
    buttonContainer: { paddingHorizontal: 20, paddingBottom: 20, marginTop: 20 },
    postRideButton: {
        backgroundColor: "#4D9EFF", paddingVertical: 18,
        borderRadius: 10, alignItems: "center",
    },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },

    // ── TABS ──────────────────────────────────────────────────
    tabContainer: {
        flexDirection: "row", marginHorizontal: 20,
        backgroundColor: "#F0F4F8", borderRadius: 12, padding: 4,
    },
    tab: {
        flex: 1, paddingVertical: 10, borderRadius: 10,
        alignItems: "center", flexDirection: "row",
        justifyContent: "center", gap: 6,
    },
    activeTab: { backgroundColor: "#FFFFFF", elevation: 2 },
    tabText: { fontSize: 14, color: "#718096", fontWeight: "600" },
    activeTabText: { color: "#4D9EFF" },
    badgeDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: "#FF6B6B",
    },

    // ── RIDE CARD ─────────────────────────────────────────────
    listContainer: { paddingHorizontal: 20, marginTop: 16 },
    rideCard: {
        backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
        marginBottom: 12, elevation: 2,
        borderWidth: 1, borderColor: "#E2E8F0",
    },
    rideCardHeader: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
    },
    rideStatusBadge: {
        backgroundColor: "#E8F4FF", paddingHorizontal: 10,
        paddingVertical: 4, borderRadius: 20,
    },
    rideStatusText: { fontSize: 12, color: "#4D9EFF", fontWeight: "700" },
    rideDate: { fontSize: 12, color: "#718096" },
    rideRoute: { marginBottom: 12 },
    routePoint: { flexDirection: "row", alignItems: "center", gap: 8 },
    routeLine: {
        width: 2, height: 20, backgroundColor: "#E2E8F0",
        marginLeft: 7, marginVertical: 4,
    },
    routeText: { fontSize: 14, color: "#2D3748", fontWeight: "600", flex: 1 },
    rideCardFooter: { flexDirection: "row", justifyContent: "space-between" },
    rideInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
    rideInfoText: { fontSize: 13, color: "#718096" },

    // ── REQUEST CARD ──────────────────────────────────────────
    requestCard: {
        backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
        marginBottom: 12, elevation: 2,
        borderWidth: 1, borderColor: "#E2E8F0",
    },
    requestInfo: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
    requestDetails: { flex: 1 },
    requestName: { fontSize: 16, fontWeight: "700", color: "#2D3748" },
    requestSeats: { fontSize: 14, color: "#718096", marginTop: 2 },
    requestButtons: { flexDirection: "row", gap: 10 },
    acceptButton: {
        flex: 1, backgroundColor: "#E8F4FF", paddingVertical: 12,
        borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#4D9EFF",
    },
    acceptText: { color: "#4D9EFF", fontWeight: "700" },
    rejectButton: {
        flex: 1, backgroundColor: "#FFF0F0", paddingVertical: 12,
        borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#FF6B6B",
    },
    rejectText: { color: "#FF6B6B", fontWeight: "700" },

    // ── EMPTY STATE ───────────────────────────────────────────
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyText: { fontSize: 18, color: "#A0AEC0", fontWeight: "600", marginTop: 12 },
    emptySubText: { fontSize: 14, color: "#CBD5E0", marginTop: 6, textAlign: "center" },
});