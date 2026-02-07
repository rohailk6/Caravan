import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SelectRoleScreen = () => {
    const router = useRouter();

    // Function to handle navigation when 'Driver' is clicked
    const handleDriverSelect = () => {
        // Navigates to the screen you provided in the image
        router.push("/driverdasboard"); 
    };

    // Function to handle navigation when 'Rider' is clicked
    const handleRiderSelect = () => {
        // Navigates to a new screen for the rider role
        router.push("/riderMainScreen"); 
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

            {/* DRIVER CARD - Updated with onPress */}
            <TouchableOpacity 
                style={styles.card}
                onPress={handleDriverSelect} // <-- New handler
            >
                <Image
                    source={require("../driver.png")} // add icon in assets
                    style={styles.icon}
                />

                <View style={styles.textBox}>
                    <Text style={styles.roleTitle}>Driver</Text>
                    <Text style={styles.roleDesc}>
                        Help people reach their destination while earning.
                    </Text>
                </View>
            </TouchableOpacity>

            {/* RIDER CARD - Updated with onPress */}
            <TouchableOpacity 
                style={styles.card}
                onPress={handleRiderSelect} // <-- New handler
            >
                <Image
                    source={require("../rider.png")} // add icon in assets
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

// Styles remain the same
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
    logoText: {
        fontSize: 32,
        fontWeight: "700",
        color: "#000",
    },
    dot: {
        color: "#4D9EFF",
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