// screens/PostRideScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../api';

export default function PostRideScreen() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  
  // Form state
  const [startLocation, setStartLocation] = useState('');
  const [startLat, setStartLat] = useState(0);
  const [startLng, setStartLng] = useState(0);
  const [endLocation, setEndLocation] = useState('');
  const [endLat, setEndLat] = useState(0);
  const [endLng, setEndLng] = useState(0);
  const [availableSeats, setAvailableSeats] = useState('1');
  const [rideDate, setRideDate] = useState(new Date());
  const [rideTime, setRideTime] = useState(new Date());
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [notes, setNotes] = useState('');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await ApiService.getMyVehicles();
      const vehicleList = response.vehicles || [];
      setVehicles(vehicleList);
      
      if (vehicleList.length > 0) {
        setSelectedVehicle(vehicleList[0]);
      } else {
        Alert.alert(
          'No Vehicle Found',
          'Please add a vehicle before posting a ride.',
          [
            {
              text: 'Add Vehicle',
              onPress: () => router.push('/driver-step-2'),
            },
            {
              text: 'Cancel',
              onPress: () => router.back(),
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      Alert.alert('Error', 'Failed to load your vehicles');
    }
  };

  const handleLocationPick = (type: 'start' | 'end') => {
    // TODO: replace with a real map picker
    if (type === 'start') {
      setStartLocation('Islamabad, F-8');
      setStartLat(33.7294);
      setStartLng(73.0931);
    } else {
      setEndLocation('Rawalpindi, Saddar');
      setEndLat(33.5972);
      setEndLng(73.0479);
    }
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const validateForm = () => {
    if (!startLocation || !endLocation) {
      Alert.alert('Missing Locations', 'Please select both pickup and dropoff locations');
      return false;
    }
    if (!availableSeats || parseInt(availableSeats) < 1) {
      Alert.alert('Invalid Seats', 'Please enter a valid number of seats');
      return false;
    }
    if (!pricePerSeat || parseFloat(pricePerSeat) < 1) {
      Alert.alert('Invalid Price', 'Please enter a valid price per seat');
      return false;
    }
    if (!selectedVehicle) {
      Alert.alert('No Vehicle', 'Please select a vehicle');
      return false;
    }
    return true;
  };

  const handlePostRide = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      await ApiService.postRide({
        start_location: { name: startLocation, latitude: startLat, longitude: startLng },
        end_location:   { name: endLocation,   latitude: endLat,   longitude: endLng   },
        available_seats: parseInt(availableSeats),
        ride_date:       formatDate(rideDate),
        ride_time:       formatTime(rideTime),
        price_per_seat:  parseFloat(pricePerSeat),
        vehicle_id:      selectedVehicle.id,
        notes:           notes || undefined,
      });
      Alert.alert(
        'Success!',
        'Your ride has been posted. Riders can now book it!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error posting ride:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to post ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2A66B5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Ride</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── ROUTE ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>

          <TouchableOpacity style={styles.locationInput} onPress={() => handleLocationPick('start')}>
            <Ionicons name="location" size={20} color="#4CAF50" />
            <Text style={[styles.locationText, !startLocation && styles.placeholderText]}>
              {startLocation || 'Select pickup location'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.locationInput} onPress={() => handleLocationPick('end')}>
            <Ionicons name="location" size={20} color="#FF6B6B" />
            <Text style={[styles.locationText, !endLocation && styles.placeholderText]}>
              {endLocation || 'Select dropoff location'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
        </View>

        {/* ── DATE & TIME ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When?</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#4D9EFF" />
              <Text style={styles.dateTimeText}>{formatDate(rideDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color="#4D9EFF" />
              <Text style={styles.dateTimeText}>{formatTime(rideTime)}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={rideDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setRideDate(selectedDate);
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={rideTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selectedTime) setRideTime(selectedTime);
              }}
            />
          )}
        </View>

        {/* ── DETAILS ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Available Seats</Text>
            <TextInput
              style={styles.input}
              value={availableSeats}
              onChangeText={setAvailableSeats}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price per Seat (PKR)</Text>
            <TextInput
              style={styles.input}
              value={pricePerSeat}
              onChangeText={setPricePerSeat}
              keyboardType="decimal-pad"
              placeholder="250"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional information..."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* ── VEHICLE SELECTION ────────────────────────────── */}
        {vehicles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  selectedVehicle?.id === vehicle.id && styles.vehicleCardSelected,
                ]}
                onPress={() => setSelectedVehicle(vehicle)}
              >
                <View style={styles.vehicleIcon}>
                  <Ionicons name="car-sport" size={24} color="#4D9EFF" />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model}</Text>
                  <Text style={styles.vehicleDetails}>{vehicle.color} • {vehicle.license_plate}</Text>
                </View>
                {selectedVehicle?.id === vehicle.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── POST BUTTON ──────────────────────────────────── */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.postButton, loading && styles.postButtonDisabled]}
          onPress={handlePostRide}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.postButtonText}>Post Ride</Text>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A66B5',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A66B5',
    marginBottom: 12,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: '#2A66B5',
  },
  placeholderText: {
    color: '#A0AEC0',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateTimeText: {
    fontSize: 15,
    color: '#2A66B5',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#2A66B5',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  vehicleCardSelected: {
    borderColor: '#4D9EFF',
    backgroundColor: '#F0F7FF',
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A66B5',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 13,
    color: '#718096',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4D9EFF',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  postButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});