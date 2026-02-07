// screens/DriverStep3Screen.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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

export default function DriverStep3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState(4);

  const handleYearChange = (text: string) => {
    // Only allow numbers and limit to 4 digits
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setVehicleYear(cleaned);
  };

  const incrementSeating = () => {
    if (seatingCapacity < 8) {
      setSeatingCapacity(seatingCapacity + 1);
    }
  };

  const decrementSeating = () => {
    if (seatingCapacity > 1) {
      setSeatingCapacity(seatingCapacity - 1);
    }
  };

  const handleNext = () => {
    // Validation
    if (!vehicleModel.trim()) {
      Alert.alert('Required', 'Please enter your vehicle model.');
      return;
    }
    
    if (!vehicleColor.trim()) {
      Alert.alert('Required', 'Please enter your vehicle color.');
      return;
    }

    if (!vehicleYear.trim() || vehicleYear.length !== 4) {
      Alert.alert('Invalid Year', 'Please enter a valid 4-digit year.');
      return;
    }

    const year = parseInt(vehicleYear);
    const currentYear = new Date().getFullYear();
    if (year < 1990 || year > currentYear + 1) {
      Alert.alert('Invalid Year', `Please enter a year between 1990 and ${currentYear + 1}.`);
      return;
    }

    // Navigate to next step
    router.push({
      pathname: '/driver-step-4',
      params: {
        ...params,
        vehicleModel,
        vehicleColor,
        vehicleYear,
        seatingCapacity: seatingCapacity.toString(),
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
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.stepText}>3 of 5</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Vehicle Specs</Text>

          {/* Input Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vehicle Model</Text>
              <TextInput
                style={styles.input}
                value={vehicleModel}
                onChangeText={setVehicleModel}
                placeholder="e.g., Honda Civic"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vehicle Color</Text>
              <TextInput
                style={styles.input}
                value={vehicleColor}
                onChangeText={setVehicleColor}
                placeholder="e.g., White"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vehicle Year</Text>
              <TextInput
                style={styles.input}
                value={vehicleYear}
                onChangeText={handleYearChange}
                placeholder="e.g., 2020"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            {/* Seating Capacity Counter */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Seating Capacity</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={[
                    styles.counterButton,
                    seatingCapacity <= 1 && styles.counterButtonDisabled
                  ]}
                  onPress={decrementSeating}
                  disabled={seatingCapacity <= 1}
                >
                  <Ionicons 
                    name="remove" 
                    size={24} 
                    color={seatingCapacity <= 1 ? '#CBD5E0' : '#4D9EFF'} 
                  />
                </TouchableOpacity>

                <View style={styles.counterDisplay}>
                  <Text style={styles.counterValue}>{seatingCapacity}</Text>
                  <Text style={styles.counterLabel}>
                    {seatingCapacity === 1 ? 'passenger' : 'passengers'}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[
                    styles.counterButton,
                    seatingCapacity >= 8 && styles.counterButtonDisabled
                  ]}
                  onPress={incrementSeating}
                  disabled={seatingCapacity >= 8}
                >
                  <Ionicons 
                    name="add" 
                    size={24} 
                    color={seatingCapacity >= 8 ? '#CBD5E0' : '#4D9EFF'} 
                  />
                </TouchableOpacity>
              </View>
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
  formContainer: {
    gap: 24,
  },
  inputGroup: {
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
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonDisabled: {
    backgroundColor: '#F7FAFC',
  },
  counterDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2A66B5',
  },
  counterLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
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