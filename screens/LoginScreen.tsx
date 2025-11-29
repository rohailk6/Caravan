import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Hide default header */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>

        {/* BACK ARROW */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/onboarding-three')}
        >
          <Ionicons name="chevron-back" size={26} color="#1E2B3C" />
        </TouchableOpacity>


        {/* Top Section */}
        <View style={styles.contentContainer}>
          <Image
            source={require('../login_image1.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Have a better sharing experience</Text>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.createButtonText}>Create an account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.8}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>

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
  },

  /* -------- BACK ARROW -------- */
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    elevation: 5,         // Android shadow
    shadowColor: "#000",  // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },


  /* -------- Content (Image + Text) -------- */
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  illustration: {
    width: width * 0.9,
    height: height * 0.32,
    marginBottom: 40,
  },

  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 28,
    color: '#1E2B3C',
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#6BB7FF',
    marginBottom: 20,
    textAlign: 'center',
  },

  /* -------- Buttons -------- */
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  createButton: {
    width: '100%',
    backgroundColor: '#4D9FFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },

  loginButton: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#4D9FFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  loginButtonText: {
    color: '#4D9FFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },
});

export default LoginScreen;
