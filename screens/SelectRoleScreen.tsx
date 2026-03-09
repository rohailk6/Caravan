import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { setRole } from "../api"; // ← import api function

const SelectRoleScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false); // ← prevents double tap

    // ── DRIVER ──────────────────────────────────────
    const handleDriverSelect = async () => {
        setLoading(true);
        try {
            await setRole('driver');           // ← saves role to database
            router.push("/choose-vehicle");    // ← then navigate
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.response?.data?.detail || "Could not set role. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ── RIDER ───────────────────────────────────────
    const handleRiderSelect = async () => {
        setLoading(true);
        try {
            await setRole('rider');            // ← saves role to database
            router.push("/riderMainScreen");   // ← then navigate
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.response?.data?.detail || "Could not set role. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>

            <Stack.Screen options={{ headerShown: false }} />

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={22} color="#000" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require("../logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color="#4D9EFF" />
                </TouchableOpacity>
            </View>

            <Text style={styles.title}>Select your role.</Text>

            {/* Loading indicator while API call is running */}
            {loading && (
                <ActivityIndicator
                    size="large"
                    color="#4D9EFF"
                    style={{ marginTop: 20 }}
                />
            )}

            {/* DRIVER CARD */}
            <TouchableOpacity
                style={[styles.card, loading && { opacity: 0.5 }]}
                onPress={handleDriverSelect}
                disabled={loading}  // ← cant tap while loading
            >
                <Image
                    source={require("../driver.png")}
                    style={styles.icon}
                />
                <View style={styles.textBox}>
                    <Text style={styles.roleTitle}>Driver</Text>
                    <Text style={styles.roleDesc}>
                        Help people reach their destination while earning.
                    </Text>
                </View>
            </TouchableOpacity>

            {/* RIDER CARD */}
            <TouchableOpacity
                style={[styles.card, loading && { opacity: 0.5 }]}
                onPress={handleRiderSelect}
                disabled={loading}  // ← cant tap while loading
            >
                <Image
                    source={require("../rider.png")}
                    style={styles.icon}
                />
                <View style={styles.textBox}>
                    <Text style={styles.roleTitle}>Rider</Text>
                    <Text style={styles.roleDesc}>
                        Share rides, save money, and travel comfortably.
                    </Text>
                </View>
            </TouchableOpacity>

        </View>
    );
};

export default SelectRoleScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    backText: {
        marginLeft: 4,
        fontSize: 16,
        color: "#000",
    },
    logoContainer: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    menuButton: {
        backgroundColor: "#E4F0FF",
        padding: 8,
        borderRadius: 8,
    },
    title: {
        marginTop: 20,
        fontSize: 22,
        fontWeight: "600",
        textAlign: "center",
        color: "#333",
    },
    card: {
        marginTop: 25,
        backgroundColor: "#DCEBFF",
        borderRadius: 20,
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        width: 60,
        height: 60,
        marginRight: 18,
        tintColor: "#4D9EFF",
    },
    textBox: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2A66B5",
    },
    roleDesc: {
        marginTop: 5,
        fontSize: 15,
        color: "#333",
    },
    logo: {
        width: 140,
        height: 50,
    },
});
