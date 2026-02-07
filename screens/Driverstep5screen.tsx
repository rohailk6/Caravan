// screens/DriverStep5Screen.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DriverStep5Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // CNIC Images
  const [cnicFront, setCnicFront] = useState<string | null>(null);
  const [cnicBack, setCnicBack] = useState<string | null>(null);
  
  // Preferences
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [musicAllowed, setMusicAllowed] = useState(true);
  const [femaleOnly, setFemaleOnly] = useState(false);
  
  // Agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkmarkScale] = useState(new Animated.Value(0));

  const pickImage = async (
    type: 'front' | 'back',
    setter: (uri: string) => void
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload your CNIC.',
        [{ text: 'OK' }]
      );
      return;
    }

    const title = type === 'front' ? 'Upload CNIC Front' : 'Upload CNIC Back';

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

  const animateCheckmark = () => {
    Animated.sequence([
      Animated.spring(checkmarkScale, {
        toValue: 1.2,
        useNativeDriver: true,
        tension: 50,
        friction: 3,
      }),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 3,
      }),
    ]).start();
  };

  const handleFinish = () => {
    // Validation
    if (!cnicFront || !cnicBack) {
      Alert.alert('Required', 'Please upload both front and back of your CNIC.');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Agreement Required', 'Please agree to the Community Guidelines and Fair-Pricing policy to continue.');
      return;
    }

    // Show success modal
    setShowSuccessModal(true);
    animateCheckmark();

    // Here you would typically submit all the data to your backend
    console.log('All onboarding data:', {
      ...params,
      cnicFront,
      cnicBack,
      preferences: {
        smokingAllowed,
        musicAllowed,
        femaleOnly,
      },
      agreedToTerms,
    });

    // Navigate to main app after delay
    setTimeout(() => {
      // router.replace('/dashboard'); // Replace with your main app route
      // For now, just close the modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        Alert.alert('Success', 'Your application will be reviewed within 24-48 hours. We\'ll notify you via email.');
      }, 2000);
    }, 2000);
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
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.stepText}>5 of 5</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Trust & Preferences</Text>

          {/* Section 1: CNIC Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identity Verification</Text>
            <Text style={styles.sectionSubtext}>
              Upload a clear photo of both sides of your CNIC
            </Text>
            
            <View style={styles.cnicContainer}>
              {/* CNIC Front */}
              <TouchableOpacity 
                style={styles.cnicCard}
                onPress={() => pickImage('front', setCnicFront)}
                activeOpacity={0.7}
              >
                {cnicFront ? (
                  <Image 
                    source={{ uri: cnicFront }} 
                    style={styles.cnicImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.cnicPlaceholder}>
                    <Ionicons name="card-outline" size={32} color="#4D9EFF" />
                    <Text style={styles.cnicText}>Upload Front</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* CNIC Back */}
              <TouchableOpacity 
                style={styles.cnicCard}
                onPress={() => pickImage('back', setCnicBack)}
                activeOpacity={0.7}
              >
                {cnicBack ? (
                  <Image 
                    source={{ uri: cnicBack }} 
                    style={styles.cnicImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.cnicPlaceholder}>
                    <Ionicons name="card-outline" size={32} color="#4D9EFF" />
                    <Text style={styles.cnicText}>Upload Back</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 2: Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Carpool Preferences</Text>
            <Text style={styles.sectionSubtext}>
              Set your ride preferences to match with compatible passengers
            </Text>
            
            <View style={styles.preferencesCard}>
              {/* Smoking Allowed */}
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceLeft}>
                  <View style={styles.preferenceIconContainer}>
                    <Ionicons name="leaf-outline" size={20} color="#4D9EFF" />
                  </View>
                  <View>
                    <Text style={styles.preferenceLabel}>Smoking Allowed</Text>
                    <Text style={styles.preferenceDescription}>Allow smoking in your vehicle</Text>
                  </View>
                </View>
                <Switch
                  value={smokingAllowed}
                  onValueChange={setSmokingAllowed}
                  trackColor={{ false: '#E2E8F0', true: '#4D9EFF' }}
                  thumbColor={smokingAllowed ? '#FFFFFF' : '#FFFFFF'}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>

              <View style={styles.divider} />

              {/* Music Allowed */}
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceLeft}>
                  <View style={styles.preferenceIconContainer}>
                    <Ionicons name="musical-notes-outline" size={20} color="#4D9EFF" />
                  </View>
                  <View>
                    <Text style={styles.preferenceLabel}>Music Allowed</Text>
                    <Text style={styles.preferenceDescription}>Play music during rides</Text>
                  </View>
                </View>
                <Switch
                  value={musicAllowed}
                  onValueChange={setMusicAllowed}
                  trackColor={{ false: '#E2E8F0', true: '#4D9EFF' }}
                  thumbColor={musicAllowed ? '#FFFFFF' : '#FFFFFF'}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>

              <View style={styles.divider} />

              {/* Female Only */}
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceLeft}>
                  <View style={styles.preferenceIconContainer}>
                    <Ionicons name="woman-outline" size={20} color="#4D9EFF" />
                  </View>
                  <View>
                    <Text style={styles.preferenceLabel}>Offer to females only</Text>
                    <Text style={styles.preferenceDescription}>For added safety and comfort</Text>
                  </View>
                </View>
                <Switch
                  value={femaleOnly}
                  onValueChange={setFemaleOnly}
                  trackColor={{ false: '#E2E8F0', true: '#4D9EFF' }}
                  thumbColor={femaleOnly ? '#FFFFFF' : '#FFFFFF'}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>
            </View>
          </View>

          {/* Section 3: Agreement */}
          <TouchableOpacity 
            style={styles.agreementContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.agreementText}>
              I agree to the{' '}
              <Text style={styles.agreementLink}>Carvaan Community Guidelines</Text>
              {' '}and{' '}
              <Text style={styles.agreementLink}>Fair-Pricing policy</Text>
            </Text>
          </TouchableOpacity>
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
            style={styles.finishButton}
            onPress={handleFinish}
            activeOpacity={0.8}
          >
            <Text style={styles.finishButtonText}>FINISH</Text>
            <Ionicons name="checkmark-circle" size={24} color="#2A66B5" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Animated.View 
              style={[
                styles.checkmarkContainer,
                { transform: [{ scale: checkmarkScale }] }
              ]}
            >
              <Ionicons name="checkmark-circle" size={80} color="#48BB78" />
            </Animated.View>
            
            <Text style={styles.successTitle}>Verification Under Review</Text>
            <Text style={styles.successMessage}>
              Thank you for completing your driver registration! Our team will review your documents within 24-48 hours.
            </Text>
            <Text style={styles.successSubtext}>
              You'll receive an email notification once your account is verified.
            </Text>
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A66B5',
    marginBottom: 6,
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
    lineHeight: 20,
  },
  cnicContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cnicCard: {
    flex: 1,
    aspectRatio: 1.6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4D9EFF',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  cnicPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  cnicText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4D9EFF',
    marginTop: 8,
  },
  cnicImage: {
    width: '100%',
    height: '100%',
  },
  preferencesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  preferenceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A66B5',
  },
  preferenceDescription: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#4D9EFF',
    borderColor: '#4D9EFF',
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  agreementLink: {
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
  finishButton: {
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
  finishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmarkContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A66B5',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  successSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
});