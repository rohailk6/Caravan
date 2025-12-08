import { useRouter } from 'expo-router'; // Allows Navigation between screens 
import React from 'react';
import { Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
// Imports core React Native components:
// Dimensions: Get screen width & height
// Image: Display images
// SafeAreaView: Respect notches / status bars on phones
// StatusBar: Customize the phone’s top status bar
// StyleSheet: Create styles
// Text: Display text
// TouchableOpacity: Make buttons with press effects
// View: Basic container componen

const { width, height } = Dimensions.get('window') // Useful to make your layout responsive.

const testonboarding = () => { //Declares the main functional component for your onboarding screen.
    const router = useRouter(); // Initializes the router so you can navigate to other screens.

    const handlePress = () => { //Function that runs when the button is pressed.
        router.push('/onboarding-two') // Uses router.push to navigate to the second onboarding screen.
    }
    //SVG PARAMETERS FOR THE RING SIZE
    const ringSize = 72;//Size of the SVG ring (width & height).
    const strokeWidth = 4; //Thickness of the ring.
    const radius = (ringSize - strokeWidth) / 2; // Radius of the circle 
    const circumference = radius * 2 * Math.PI;
    const progress = 0.3;
    const strokeDashoffset = circumference - circumference * progress; //Controls how much of the circle is visible, creating the “progress effect”.

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>

                <Image source={require('../logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Image source={require('../image 1.png')} style={styles.illustration} resizeMode="contain" />

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Share ride, Save more.</Text>
                    <Text style={styles.description}>
                        Join others heading your way — save fuel, money, and time while helping the planet.
                    </Text>
                </View>

                <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8} onPress={handlePress}>


            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingTop: height * 0.05,
        paddingBottom: height * 0.02,
    },
    logo: {
        width: width * 0.5,
        height: 50,
        marginBottom: 20,
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    title: {
        fontFamily: 'Poppins-Medium',
        fontSize: 24,
        color: '#1E2B3B',
        textAlign: 'center',
        marginBottom: 16,
    },
    illustration: {

    },
    description: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#6BB7FF',
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {

    },



})

