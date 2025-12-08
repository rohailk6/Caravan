import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DriverDashboardScreen = () => {
    const router = useRouter();
    
    // Assuming these assets are siblings to this file (in the project root)
    const logoSource = require("../logo.png"); 
    // Using the full design image
    const carImageSource = require("../drivercar1.png");

    return (
        <View style={styles.container}>

            <Stack.Screen options={{ headerShown: false }} />

            {/* Top Header */}
            <View style={styles.header}>
                {/* Back Button (Top Left) */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                
                {/* Logo (Center) */}
                <View style={styles.logoContainer}>
                    <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
                </View>

                {/* Menu Button (Top Right) - Empty space to balance layout */}
                <View style={styles.menuSpacer} /> 
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                
                {/* Car Image with Map Pin */}
                <View style={styles.carContainer}>
                    {/* *** IMPORTANT FIX: ***
                       The manual Ionicons component is removed. This was causing the overlap/blur 
                       because the image drivercar1.png already contains the map pin icon.
                       
                       <Ionicons name="location" size={50} color="#4D9EFF" style={styles.pinIcon} /> 
                    */}
                    <Image
                        source={carImageSource} 
                        style={styles.carImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Question Text */}
                <Text style={styles.questionText}>Do you want to post a ride?</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.postRideButton} 
                    onPress={() => {/* Navigation or Logic for POST A RIDE */}}
                >
                    <Text style={styles.buttonText}>POST A RIDE</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.checkUpdatesButton} 
                    onPress={() => {/* Navigation or Logic for CHECK RIDE UPDATES */}}
                >
                    <Text style={styles.buttonText}>CHECK RIDE UPDATES</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default DriverDashboardScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 60,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        marginBottom: 40,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    backText: {
        marginLeft: 4,
        fontSize: 16,
        color: "#000",
    },
    logoContainer: {
        flex: 1, 
        alignItems: "center",
        justifyContent: "center",
        position: 'absolute', 
        left: 0,
        right: 0,
    },
    logoImage: {
        width: 140,
        height: 40,
    },
    menuSpacer: { 
        width: 60, 
    }, 
    
    // --- Main Content Styles ---
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    carContainer: {
        // Ensures the image is centered
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: 50,
        width: '100%', 
    },
    // The pinIcon style is no longer needed since the <Ionicons> component was removed.
    // pinIcon: {
    //     position: 'absolute',
    //     top: -30, 
    //     zIndex: 1,
    // },
    carImage: {
        width: '90%',
        height: 150,
    },
    questionText: {
        fontSize: 30,
        fontWeight: "500",
        textAlign: "center",
        color: "#333",
        lineHeight: 40,
    },

    // --- Button Styles ---
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    postRideButton: {
        backgroundColor: "#4D9EFF",
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 15,
    },
    checkUpdatesButton: {
        backgroundColor: "#4D9EFF", 
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});