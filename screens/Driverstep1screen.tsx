// screens/DriverStep1Screen.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'; // 1. Added Stack
import React, { useState } from 'react';
import {
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

export default function DriverStep1Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Logic for Step 2
    router.push({
      pathname: '/driver-step-2',
      params: { ...params, firstName, lastName, dateOfBirth, profileImage },
    });
  };

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 2) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
    if (cleaned.length >= 4) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 4) + '.' + cleaned.slice(4, 8);
    return formatted;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 2. Hide the default navigation header */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Custom Header (The UI one) */}
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
              <View style={[styles.progressFill, { width: '20%' }]} />
            </View>
            <Text style={styles.stepText}>1 of 5</Text>
          </View>

          <Text style={styles.title}>Personal information</Text>

          {/* Profile Picture Upload */}
          <View style={styles.profileSection}>
            <TouchableOpacity 
              style={styles.profileImageContainer}
              onPress={pickImage}
            >
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Ionicons name="add" size={40} color="#4D9EFF" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.profileLabel}>Personal picture</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Rohail"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Nawaz"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of birth</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={(t) => setDateOfBirth(formatDate(t))}
                placeholder="22.05.2003"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
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
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7FF' },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  helpText: { fontSize: 16, color: '#4D9EFF', fontWeight: '600' },
  progressContainer: { marginBottom: 30 },
  progressBar: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#4D9EFF', borderRadius: 2 },
  stepText: { fontSize: 14, color: '#718096' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2A66B5', marginBottom: 30 },
  profileSection: { alignItems: 'center', marginBottom: 40 },
  profileImageContainer: { marginBottom: 12 },
  profilePlaceholder: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF',
    borderWidth: 2, borderColor: '#4D9EFF', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  profileLabel: { fontSize: 14, color: '#718096' },
  inputSection: { gap: 24 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, color: '#4A5568', fontWeight: '500' },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, fontSize: 16,
    color: '#2D3748', borderWidth: 1, borderColor: '#E2E8F0',
  },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 20, backgroundColor: '#F0F7FF',
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  prevButton: {
    width: 56, height: 56, borderRadius: 12, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0'
  },
  nextButton: {
    flex: 1, marginLeft: 16, height: 56, borderRadius: 12, backgroundColor: '#4D9EFF',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  nextButtonText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
});