import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const OnboardingScreenThree = () => {
  const router = useRouter();

  const handlePress = () => {
    // This final button takes the user to the login screen
    router.push('/login');
  };

  // SVG parameters for a 100% full progress ring
  const ringSize = 72;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = 1.0; // 100% progress
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

       {/* Make sure to add an 'image 3.png' to your root folder for this screen */}
       <Image
        source={require('../image 3.png')}
        style={styles.illustration}
        resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Ride Safe, Ride Together.</Text>
          <Text style={styles.description}>
            Verified users, live tracking, and ratings to ensure every ride is smooth and secure.
          </Text>
        </View>

        {/* --- BUTTON UPDATED TO USE SVG --- */}
        <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8} onPress={handlePress}>
          <View style={styles.innerButton} />
          <Svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            <Circle
              stroke="#6BB7FF"
              fill="none"
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
          </Svg>
          <Text style={styles.buttonText}>Go</Text>
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
    color: '#1E2B3C',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    position: 'absolute',
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
  }
});

export default OnboardingScreenThree;

