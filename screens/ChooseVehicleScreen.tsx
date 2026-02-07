// screens/ChooseVehicleScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router'; // 1. Added Stack
import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface VehicleOption {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'car',
    title: 'Car',
    subtitle: 'Standard 4-seater',
    icon: 'car-sport',
  },
  {
    id: 'bike',
    title: 'Motorcycle',
    subtitle: 'Quick & efficient',
    icon: 'bicycle',
  },
  {
    id: 'rickshaw',
    title: 'Rickshaw',
    subtitle: 'Local transport',
    icon: 'bus',
  },
];

export default function ChooseVehicleScreen() {
  const router = useRouter();

  const handleVehicleSelect = (vehicleId: string) => {
    // Navigate to personal info screen (driver-step-1)
    router.push('/driver-step-1'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 2. Hide the default navigation header */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2A66B5" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Choose your vehicle</Text>

        <View style={styles.vehicleList}>
          {VEHICLE_OPTIONS.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={styles.vehicleCard}
              onPress={() => handleVehicleSelect(vehicle.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={vehicle.icon} 
                  size={48} 
                  color="#4D9EFF" 
                />
              </View>
              
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleTitle}>{vehicle.title}</Text>
                <Text style={styles.vehicleSubtitle}>{vehicle.subtitle}</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={24} color="#2A66B5" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2A66B5',
    marginBottom: 30,
  },
  vehicleList: {
    gap: 16,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A66B5',
    marginBottom: 4,
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
});