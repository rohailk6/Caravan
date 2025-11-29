import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const OnboardingScreenTwo = () => {
  const router = useRouter();

  const handlePress = () => {
    // This button takes the user to the main app
    router.push('/onboarding-three');
  };

  // SVG parameters for a 100% full progress ring
  const ringSize = 72;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = 0.6; // 100% progress
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

       {/* Remember to add an 'image 2.png' to your root folder for this screen */}
       <Image
        source={require('../image 2.png')}
        style={styles.illustration}
        resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Find Your Perfect Ride</Text>
          <Text style={styles.description}>
            Discover rides that match your route and schedule. Your ideal carpool is just a tap away.
          </Text>
        </View>

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
    // paddingTop: height * 0.05,
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
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#6bb7ff',
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
  },
  arrowIcon: {
    position: 'absolute',
  },
});

export default OnboardingScreenTwo;

