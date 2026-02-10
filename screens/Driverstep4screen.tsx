// screens/DriverStep4Screen.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DriverStep4Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [registrationImage, setRegistrationImage] = useState<string | null>(null);
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);

  const pickImage = async (
    type: 'registration' | 'vehicle',
    setter: (uri: string) => void
  ) => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const title = type === 'registration' 
      ? 'Upload Registration Document' 
      : 'Upload Vehicle Photo';

    // Show options: Camera or Gallery
    Alert.alert(
      title,
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraPermission.status === 'granted') {
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
              });
              if (!result.canceled) {
                setter(result.assets[0].uri);
              }
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) {
              setter(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleNext = () => {
    // Validation
    if (!registrationImage) {
      Alert.alert('Required', 'Please upload your vehicle registration document.');
      return;
    }
    
    if (!vehicleImage) {
      Alert.alert('Required', 'Please upload a photo of your vehicle.');
      return;
    }

    // Navigate to final step
    router.push({
      pathname: '/driver-step-5',
      params: {
        ...params,
        registrationImage,
        vehicleImage,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
        <Stack.Screen options={{headerShown: false}} />
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={28} color="#2A66B5" />
            </TouchableOpacity>
            
            <Text style={styles.helpText}>Help</Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
            <Text style={styles.stepText}>4 of 5</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Vehicle Documentation</Text>

          {/* Registration Document Upload */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionLabel}>Registration Document</Text>
            <Text style={styles.sectionSubtext}>
              Upload a clear photo of your Vehicle Smart Card or Registration Certificate
            </Text>
            
            <TouchableOpacity 
              style={styles.uploadCard}
              onPress={() => pickImage('registration', setRegistrationImage)}
              activeOpacity={0.7}
            >
              {registrationImage ? (
                <Image 
                  source={{ uri: registrationImage }} 
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="document-text" size={40} color="#4D9EFF" />
                  </View>
                  <Text style={styles.uploadText}>Upload Document</Text>
                  <Text style={styles.uploadSubtext}>Tap to take a photo or choose from gallery</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {registrationImage && (
              <TouchableOpacity 
                style={styles.changePhotoButton}
                onPress={() => pickImage('registration', setRegistrationImage)}
              >
                <Ionicons name="camera" size={16} color="#4D9EFF" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Vehicle Photo Upload */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionLabel}>Vehicle Exterior Photo</Text>
            <Text style={styles.sectionSubtext}>
              Take a clear photo of your vehicle from the front showing the license plate
            </Text>
            
            <TouchableOpacity 
              style={styles.uploadCard}
              onPress={() => pickImage('vehicle', setVehicleImage)}
              activeOpacity={0.7}
            >
              {vehicleImage ? (
                <Image 
                  source={{ uri: vehicleImage }} 
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="car-sport" size={40} color="#4D9EFF" />
                  </View>
                  <Text style={styles.uploadText}>Upload Vehicle Photo</Text>
                  <Text style={styles.uploadSubtext}>Tap to take a photo or choose from gallery</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {vehicleImage && (
              <TouchableOpacity 
                style={styles.changePhotoButton}
                onPress={() => pickImage('vehicle', setVehicleImage)}
              >
                <Ionicons name="camera" size={16} color="#4D9EFF" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.prevButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#2A66B5" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  helpText: {
    fontSize: 16,
    color: '#4D9EFF',
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4D9EFF',
    borderRadius: 2,
  },
  stepText: {
    fontSize: 14,
    color: '#718096',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2A66B5',
    marginBottom: 30,
  },
  uploadSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
    lineHeight: 20,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4D9EFF',
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 200,
  },
  uploadPlaceholder: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A66B5',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#4D9EFF',
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F0F7FF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  prevButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#4D9EFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});