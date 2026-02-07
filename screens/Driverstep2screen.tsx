// screens/DriverStep2Screen.tsx
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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DriverStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [plateNumber, setPlateNumber] = useState('');

  const pickLicenseImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload your license.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Show options: Camera or Gallery
    Alert.alert(
      'Upload License',
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
                setLicenseImage(result.assets[0].uri);
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
              setLicenseImage(result.assets[0].uri);
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

  const formatPlateNumber = (text: string) => {
    // Convert to uppercase and limit characters
    return text.toUpperCase().slice(0, 10);
  };

  const handlePlateChange = (text: string) => {
    setPlateNumber(formatPlateNumber(text));
  };

  const handleNext = () => {
    // Validation
    if (!licenseImage) {
      Alert.alert('Required', 'Please upload your driving license.');
      return;
    }
    
    if (!plateNumber.trim()) {
      Alert.alert('Required', 'Please enter your vehicle plate number.');
      return;
    }

    // Navigate to next step
    router.push({
      pathname: '/driver-step-3',
      params: {
        ...params,
        licenseImage,
        plateNumber,
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
              <View style={[styles.progressFill, { width: '40%' }]} />
            </View>
            <Text style={styles.stepText}>2 of 5</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Driver Identity</Text>

          {/* License Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionLabel}>Driving License</Text>
            <TouchableOpacity 
              style={styles.uploadCard}
              onPress={pickLicenseImage}
              activeOpacity={0.7}
            >
              {licenseImage ? (
                <Image 
                  source={{ uri: licenseImage }} 
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.cameraIconContainer}>
                    <Ionicons name="camera" size={40} color="#4D9EFF" />
                  </View>
                  <Text style={styles.uploadText}>Upload License Photo</Text>
                  <Text style={styles.uploadSubtext}>Tap to take a photo or choose from gallery</Text>
                </View>
              )}
            </TouchableOpacity>
            {licenseImage && (
              <TouchableOpacity 
                style={styles.changePhotoButton}
                onPress={pickLicenseImage}
              >
                <Ionicons name="camera" size={16} color="#4D9EFF" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Plate Number Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Vehicle Plate Number</Text>
            <TextInput
              style={styles.input}
              value={plateNumber}
              onChangeText={handlePlateChange}
              placeholder="ABC-1234"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="characters"
            />
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
    paddingBottom: 100,
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
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '600',
    marginBottom: 12,
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
  cameraIconContainer: {
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
  inputSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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