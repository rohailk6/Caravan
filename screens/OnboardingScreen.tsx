import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// --- 1. SVG Components Imported ---
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const router = useRouter();

  const handlePress = () => {
    // This now navigates to the second onboarding screen we planned
    router.push('/onboarding-two');
  };

  // --- 2. SVG Parameters Defined ---
  const ringSize = 72;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = 0.3; // 50% progress for the half-filled look
  const strokeDashoffset = circumference - circumference * progress;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        <Image
          source={require('../logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

       <Image
        source={require('../image 1.png')}
        style={styles.illustration}
        resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Share ride, Save more.</Text>
          <Text style={styles.description}>
            Join others heading your way — save fuel, money, and time while helping the planet.
          </Text>
        </View>

        {/* --- 3. Button Section Replaced with SVG Logic --- */}
        <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8} onPress={handlePress}>
          {/* Inner solid blue circle */}
          <View style={styles.innerButton} />
          
          {/* SVG for the progress rings */}
          <Svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            {/* Background grey ring */}
            <Circle
              stroke="#E5E7EB" // Light grey background
              fill="none"
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Foreground blue progress ring */}
            <Circle
              stroke="#6BB7FF" // Your blue color
              fill="none"
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`} // Starts the arc at the top
            />
          </Svg>

          {/* Arrow icon positioned on top of the SVG and View */}
          <FontAwesome5 style={styles.arrowIcon} name="arrow-right" size={24} color="white" />
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  illustration: {
    width: width * 0.9,
    height: height * 0.3,
    marginVertical: 20,
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
  description: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#6BB7FF',
    textAlign: 'center',
    lineHeight: 22,
  },
  // --- 4. Styles Updated for SVG Button ---
  buttonContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  innerButton: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6BB7FF',
  },
  arrowIcon: {
    position: 'absolute',
  },
});

export default OnboardingScreen;

