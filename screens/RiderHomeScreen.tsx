import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from "expo-location";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker, Polyline } from "react-native-maps";
import { bookRide, cancelBooking, getMyBookings, getProfile, searchRides } from "../api";

const { width, height } = Dimensions.get("window");

// ── SEARCHING MODAL ────────────────────────────────────────────────────────
const SearchingModal = ({
  visible,
  booking,
  onCancel,
  onConfirm,
  onMinimize,
}: {
  visible: boolean;
  booking: any;
  onCancel: () => void;
  onConfirm: () => void;
  onMinimize: () => void;
}) => {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;
  const slideUp = useRef(new Animated.Value(height)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const isAccepted = booking?.status === "accepted";
  const isRejected = booking?.status === "rejected";

  // Slide up when visible
  useEffect(() => {
    if (visible) {
      Animated.spring(slideUp, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      slideUp.setValue(height);
    }
  }, [visible]);

  // Pulse rings animation while searching
  useEffect(() => {
    if (visible && !isAccepted && !isRejected) {
      const makePulse = (val: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(val, { toValue: 2.8, duration: 1800, useNativeDriver: true }),
              Animated.timing(val, { toValue: 2.8, duration: 1800, useNativeDriver: true }),
            ]),
            Animated.timing(val, { toValue: 1, duration: 0, useNativeDriver: true }),
          ])
        );

      animRef.current = Animated.parallel([
        makePulse(pulse1, 0),
        makePulse(pulse2, 600),
        makePulse(pulse3, 1200),
      ]);
      animRef.current.start();
    } else {
      animRef.current?.stop();
      pulse1.setValue(1);
      pulse2.setValue(1);
      pulse3.setValue(1);
    }
    return () => animRef.current?.stop();
  }, [visible, isAccepted, isRejected]);

  if (!visible) return null;

  // ── DRIVER FOUND CARD ─────────────────────────────────
  if (isAccepted && booking) {
    return (
      <Modal visible transparent animationType="none">
        <View style={ms.overlay}>
          <Animated.View style={[ms.sheet, { transform: [{ translateY: slideUp }] }]}>
            <View style={ms.handle} />

            {/* Success Header */}
            <View style={ms.successHeader}>
              <View style={ms.successIconWrap}>
                <Ionicons name="checkmark-circle" size={52} color="#4CAF50" />
              </View>
              <Text style={ms.successTitle}>Driver Found!</Text>
              <Text style={ms.successSubtitle}>Your ride has been confirmed</Text>
            </View>

            {/* Driver Info */}
            <View style={ms.driverCard}>
              <View style={ms.driverLeft}>
                <View style={[ms.driverAvatar, { backgroundColor: "#4D9EFF" }]}>
                  <Text style={ms.driverInitial}>
                    {booking.driver_name?.charAt(0).toUpperCase() || "D"}
                  </Text>
                </View>
                <View>
                  <Text style={ms.driverName}>{booking.driver_name}</Text>
                  <View style={ms.starsRow}>
                    {[1,2,3,4,5].map(i => (
                      <Ionicons key={i} name="star" size={12} color="#FFB800" />
                    ))}
                  </View>
                  {booking.driver_phone && (
                    <Text style={ms.driverPhone}>{booking.driver_phone}</Text>
                  )}
                </View>
              </View>
              <View style={ms.driverRight}>
                <Ionicons name="call-outline" size={28} color="#4D9EFF" />
              </View>
            </View>

            {/* Vehicle Info */}
            <View style={ms.vehicleCard}>
              <Ionicons name="car-outline" size={20} color="#4D9EFF" />
              <View style={ms.vehicleInfo}>
                <Text style={ms.vehicleTitle}>
                  {booking.vehicle_color
                    ? `${booking.vehicle_color} ${booking.vehicle_make || ""} ${booking.vehicle_model || ""}`.trim()
                    : booking.vehicle_type || "Vehicle"}
                </Text>
                {booking.vehicle_plate && (
                  <Text style={ms.vehiclePlate}>{booking.vehicle_plate}</Text>
                )}
              </View>
              <View style={ms.vehicleTypeBadge}>
                <Text style={ms.vehicleTypeText}>{booking.vehicle_type || "Mini"}</Text>
              </View>
            </View>

            {/* Route Summary */}
            <View style={ms.routeSummary}>
              <View style={ms.routeRow}>
                <View style={ms.routeDotGreen} />
                <Text style={ms.routeText} numberOfLines={1}>
                  {booking.start_location?.name || "Pickup"}
                </Text>
              </View>
              <View style={ms.routeVertLine} />
              <View style={ms.routeRow}>
                <View style={ms.routeDotRed} />
                <Text style={ms.routeText} numberOfLines={1}>
                  {booking.end_location?.name || "Drop-off"}
                </Text>
              </View>
            </View>

            {/* Fare Row */}
            <View style={ms.fareRow}>
              <View style={ms.fareItem}>
                <Text style={ms.fareLabel}>Date</Text>
                <Text style={ms.fareValue}>{booking.ride_date}</Text>
              </View>
              <View style={ms.fareDivider} />
              <View style={ms.fareItem}>
                <Text style={ms.fareLabel}>Time</Text>
                <Text style={ms.fareValue}>{booking.ride_time}</Text>
              </View>
              <View style={ms.fareDivider} />
              <View style={ms.fareItem}>
                <Text style={ms.fareLabel}>Fare</Text>
                <Text style={ms.fareValueBlue}>PKR {booking.price_per_seat}</Text>
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity style={ms.confirmBtn} onPress={onConfirm}>
              <Text style={ms.confirmBtnText}>Got it, Let's Go!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // ── REJECTED STATE ────────────────────────────────────
  if (isRejected) {
    return (
      <Modal visible transparent animationType="none">
        <View style={ms.overlay}>
          <Animated.View style={[ms.sheet, { transform: [{ translateY: slideUp }] }]}>
            <View style={ms.handle} />
            <View style={ms.successHeader}>
              <View style={ms.successIconWrap}>
                <Ionicons name="close-circle" size={52} color="#FF6B6B" />
              </View>
              <Text style={[ms.successTitle, { color: "#FF6B6B" }]}>Request Declined</Text>
              <Text style={ms.successSubtitle}>The driver declined your request.</Text>
              <Text style={ms.successSubtitle}>Try booking another ride.</Text>
            </View>
            <TouchableOpacity style={[ms.confirmBtn, { backgroundColor: "#FF6B6B" }]} onPress={onConfirm}>
              <Text style={ms.confirmBtnText}>Back to Rides</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // ── SEARCHING STATE (pending) ─────────────────────────
  return (
    <Modal visible transparent animationType="none">
      <View style={ms.overlay}>
        <Animated.View style={[ms.sheet, { transform: [{ translateY: slideUp }] }]}>
          <View style={ms.handle} />

          {/* Pulse Rings */}
          <View style={ms.pulseContainer}>
            {[pulse3, pulse2, pulse1].map((p, i) => (
              <Animated.View
                key={i}
                style={[ms.pulseRing, {
                  transform: [{ scale: p }],
                  opacity: p.interpolate({ inputRange: [1, 2.8], outputRange: [0.4, 0] }),
                }]}
              />
            ))}
            <View style={ms.pulseCenter}>
              <Ionicons name="car-sport" size={32} color="#fff" />
            </View>
          </View>

          <Text style={ms.searchingTitle}>Searching for Driver...</Text>
          <Text style={ms.searchingSubtitle}>
            Waiting for a driver to accept your request
          </Text>

          {/* Ride Info Summary */}
          {booking && (
            <View style={ms.pendingInfo}>
              <View style={ms.pendingRow}>
                <Ionicons name="radio-button-on" size={14} color="#4D9EFF" />
                <Text style={ms.pendingText} numberOfLines={1}>
                  {booking.start_location?.name || "Pickup"}
                </Text>
              </View>
              <View style={ms.pendingDash} />
              <View style={ms.pendingRow}>
                <Ionicons name="location" size={14} color="#FF6B6B" />
                <Text style={ms.pendingText} numberOfLines={1}>
                  {booking.end_location?.name || "Drop-off"}
                </Text>
              </View>
              <View style={ms.pendingMeta}>
                <Text style={ms.pendingMetaText}>
                  {booking.ride_date} • {booking.ride_time} • PKR {booking.price_per_seat}/seat
                </Text>
              </View>
            </View>
          )}

          {/* Minimize + Cancel Buttons */}
          <View style={ms.actionRow}>
            <TouchableOpacity style={ms.minimizeBtn} onPress={onMinimize}>
              <Ionicons name="chevron-down-outline" size={18} color="#4D9EFF" />
              <Text style={ms.minimizeBtnText}>Minimize</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ms.cancelBtn} onPress={onCancel}>
              <Ionicons name="close-circle-outline" size={18} color="#FF6B6B" />
              <Text style={ms.cancelBtnText}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ── MAIN SCREEN ────────────────────────────────────────────────────────────
const RiderHomeScreen = () => {
  const router = useRouter();
  const mapRef = React.useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRidesModal, setShowRidesModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("mini");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const [availableRides, setAvailableRides] = useState([]);
  const [ridesLoading, setRidesLoading] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);

  // ── BOOKING TRACKING ──────────────────────────────────
  const [activeBooking, setActiveBooking] = useState<any>(null);   // the booking being tracked
  const [showSearchModal, setShowSearchModal] = useState(false);   // show the searching modal
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getCurrentLocation();
    loadProfile();
    fetchAvailableRides();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAvailableRides();
    }, [])
  );

  // ── START POLLING when modal is open ─────────────────
  useEffect(() => {
    if (showSearchModal && activeBooking?.id) {
      startPolling(activeBooking.id);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [showSearchModal, activeBooking?.id]);

  const startPolling = (bookingId: string) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const response = await getMyBookings();
        const updated = (response.bookings || []).find((b: any) => b.id === bookingId);
        if (updated) {
          setActiveBooking(updated);
          // Stop polling once we have a terminal status
          if (updated.status === "accepted" || updated.status === "rejected" || updated.status === "cancelled") {
            stopPolling();
          }
        }
      } catch (e) {
        console.log("Polling error:", e);
      }
    }, 4000); // every 4 seconds
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.log("Could not load profile");
    }
  };

  const fetchAvailableRides = async (date?: string) => {
    setRidesLoading(true);
    try {
      const response = await searchRides(date);
      setAvailableRides(response.rides || []);
    } catch (error: any) {
      console.log("Could not load rides:", error.message);
    } finally {
      setRidesLoading(false);
    }
  };

  // ── BOOK A RIDE ───────────────────────────────────────
  const handleBookRide = async (ride: any) => {
    Alert.alert(
      "Confirm Booking",
      `Book 1 seat?\n\n📍 ${ride.start_location?.name}\n🏁 ${ride.end_location?.name}\n📅 ${ride.ride_date} at ${ride.ride_time}\n💰 PKR ${ride.price_per_seat}/seat`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book Now",
          onPress: async () => {
            setBookingInProgress(ride.id);
            try {
              const res = await bookRide(ride.id, 1);
              // Build a local booking object to show immediately in modal
              const localBooking = {
                id: res.booking_id,
                status: "pending",
                ride_id: ride.id,
                driver_name: ride.driver_name,
                start_location: ride.start_location,
                end_location: ride.end_location,
                ride_date: ride.ride_date,
                ride_time: ride.ride_time,
                price_per_seat: ride.price_per_seat,
                vehicle_type: ride.vehicle_type,
                seats_requested: 1,
              };
              setActiveBooking(localBooking);
              setShowSearchModal(true);  // ← open searching modal
              fetchAvailableRides();
            } catch (error: any) {
              const msg = error.response?.data?.detail || "Could not book ride. Please try again.";
              Alert.alert("Booking Failed", msg);
            } finally {
              setBookingInProgress(null);
            }
          },
        },
      ]
    );
  };

  // ── CANCEL BOOKING ────────────────────────────────────
  const handleCancelBooking = async () => {
    if (!activeBooking?.id) {
      setShowSearchModal(false);
      return;
    }
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking request?",
      [
        { text: "Keep Waiting", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelBooking(activeBooking.id);
            } catch (e) {
              // Cancel silently even if API fails
            }
            stopPolling();
            setShowSearchModal(false);
            setActiveBooking(null);
            fetchAvailableRides();
          },
        },
      ]
    );
  };

  // ── MINIMIZE (hide modal, keep booking alive) ────────
  const handleMinimize = () => {
    setShowSearchModal(false);
    // booking stays pending in DB, polling continues in background
  };

  // ── LOGOUT ────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            setSidebarVisible(false);
            router.replace('/login2');
          },
        },
      ]
    );
  };

  // ── CONFIRM (driver found / rejected) ─────────────────
  const handleConfirmOrDismiss = () => {
    stopPolling();
    setShowSearchModal(false);
    setActiveBooking(null);
    fetchAvailableRides();
    // On accepted, clear destination so screen is fresh
    if (activeBooking?.status === "accepted") {
      setSearchQuery("");
      setDestinationLocation(null);
      setRouteCoordinates([]);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCurrentLocation({ latitude: 34.0151, longitude: 71.5249, latitudeDelta: 0.015, longitudeDelta: 0.015 });
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setLoading(false);
    } catch (error) {
      setCurrentLocation({ latitude: 34.0151, longitude: 71.5249, latitudeDelta: 0.015, longitudeDelta: 0.015 });
      setLoading(false);
    }
  };

  const handleCenterLocation = () => { getCurrentLocation(); };

  const vehicleOptions = [
    { id: "mini", icon: "car-outline", label: "Mini", passengers: 4 },
    { id: "moto", icon: "bicycle-outline", label: "Moto", passengers: 1 },
    { id: "rideac", icon: "car-sport-outline", label: "Ride A/C", passengers: 4 },
    { id: "city", icon: "briefcase-outline", label: "City", passengers: 4 },
  ];

  const searchLocation = async (query) => {
    if (!query || query.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pk&limit=5`,
        { headers: { "User-Agent": "Carvaan-App" } }
      );
      const data = await response.json();
      setSuggestions(data.map((item) => ({
        id: item.place_id,
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      })));
      setShowSuggestions(true);
    } catch (error) { setSuggestions([]); }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => { searchLocation(text); }, 500);
    setSearchTimeout(timeout);
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
    const destination = { latitude: suggestion.latitude, longitude: suggestion.longitude };
    setDestinationLocation(destination);
    getRoute(currentLocation, destination);
    fetchAvailableRides();

    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        [{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }, destination],
        { edgePadding: { top: 100, right: 50, bottom: 300, left: 50 }, animated: true }
      );
    }
  };

  const getRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes?.length > 0) {
        setRouteCoordinates(data.routes[0].geometry.coordinates.map((coord) => ({
          latitude: coord[1], longitude: coord[0],
        })));
      }
    } catch (error) {
      setRouteCoordinates([
        { latitude: start.latitude, longitude: start.longitude },
        { latitude: end.latitude, longitude: end.longitude },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#4D9EFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Map */}
      <MapView ref={mapRef} style={styles.map} initialRegion={currentLocation}
        showsUserLocation={true} showsMyLocationButton={false}>
        {currentLocation && (
          <>
            <Marker coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.currentLocationMarker}><View style={styles.markerDot} /></View>
            </Marker>
            <Circle center={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
              radius={1000} fillColor="rgba(77, 158, 255, 0.1)" strokeColor="rgba(77, 158, 255, 0.3)" strokeWidth={2} />
            <Circle center={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
              radius={2000} fillColor="rgba(77, 158, 255, 0.05)" strokeColor="rgba(77, 158, 255, 0.2)" strokeWidth={1} />
          </>
        )}
        {destinationLocation && <Marker coordinate={destinationLocation} pinColor="#FF6B6B" title="Destination" />}
        {routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeColor="#4D9EFF" strokeWidth={4} />}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarVisible(true)}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} /><View style={styles.menuLine} /><View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.centerLocationButton} onPress={handleCenterLocation}>
        <Ionicons name="locate" size={24} color="#333" />
      </TouchableOpacity>

      {/* Bottom Search Section */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
        <View style={styles.bottomSection}>

          {/* Vehicle Options */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleContainer} contentContainerStyle={styles.vehicleScrollContent}>
            {vehicleOptions.map((vehicle) => (
              <TouchableOpacity key={vehicle.id}
                style={[styles.vehicleOption, selectedVehicle === vehicle.id && styles.vehicleOptionActive]}
                onPress={() => setSelectedVehicle(vehicle.id)}>
                <View style={styles.vehicleIconContainer}>
                  <Ionicons name={vehicle.icon} size={24} color={selectedVehicle === vehicle.id ? "#fff" : "#4D9EFF"} />
                </View>
                <Text style={[styles.vehicleLabel, selectedVehicle === vehicle.id && styles.vehicleLabelActive]}>{vehicle.label}</Text>
                <View style={styles.passengerInfo}>
                  <Ionicons name="person" size={10} color={selectedVehicle === vehicle.id ? "#4D9EFF" : "#999"} />
                  <Text style={[styles.passengerText, selectedVehicle === vehicle.id && styles.passengerTextActive]}>{vehicle.passengers}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput style={styles.searchInput} placeholder="Where would you go?"
              placeholderTextColor="#999" value={searchQuery} onChangeText={handleSearchChange}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }} />
            {destinationLocation ? (
              <TouchableOpacity onPress={() => {
                setSearchQuery(""); setDestinationLocation(null);
                setRouteCoordinates([]);
              }}>
                <Ionicons name="close-circle" size={22} color="#999" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity><Ionicons name="heart-outline" size={24} color="#999" /></TouchableOpacity>
            )}
          </View>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                {suggestions.map((s) => (
                  <TouchableOpacity key={s.id} style={styles.suggestionItem} onPress={() => handleSelectSuggestion(s)}>
                    <Ionicons name="location-outline" size={20} color="#4D9EFF" />
                    <Text style={styles.suggestionText} numberOfLines={2}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Find Ride Button */}
          <TouchableOpacity
            style={[styles.findRideButton, !destinationLocation && styles.findRideButtonDim]}
            onPress={() => {
              if (!destinationLocation) {
                Alert.alert("Set Destination", "Please search and select your destination first.");
                return;
              }
              fetchAvailableRides();
              setShowRidesModal(true);
            }}
          >
            {ridesLoading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={styles.findRideButtonText}>Find Ride</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── RIDES BOTTOM SHEET MODAL ───────────────────────── */}
      <Modal visible={showRidesModal} transparent animationType="slide" onRequestClose={() => setShowRidesModal(false)}>
        <View style={styles.ridesModalOverlay}>
          <TouchableOpacity style={styles.ridesModalBackdrop} activeOpacity={1} onPress={() => setShowRidesModal(false)} />
          <View style={styles.ridesModalSheet}>
            <View style={styles.ridesModalHandle} />
            <View style={styles.ridesModalHeader}>
              <Text style={styles.ridesModalTitle}>Available Rides</Text>
              <TouchableOpacity onPress={() => { fetchAvailableRides(); }}>
                <Ionicons name="refresh-outline" size={20} color="#4D9EFF" />
              </TouchableOpacity>
            </View>

            {ridesLoading ? (
              <View style={styles.ridesModalLoading}>
                <ActivityIndicator size="large" color="#4D9EFF" />
                <Text style={styles.ridesModalLoadingText}>Finding rides...</Text>
              </View>
            ) : availableRides.length === 0 ? (
              <View style={styles.ridesModalEmpty}>
                <Ionicons name="car-outline" size={44} color="#CBD5E0" />
                <Text style={styles.ridesModalEmptyTitle}>No rides available</Text>
                <Text style={styles.ridesModalEmptyText}>No drivers have posted rides yet. Try again later.</Text>
              </View>
            ) : (
              <ScrollView style={styles.ridesModalList} showsVerticalScrollIndicator={false}>
                {availableRides.map((ride: any) => {
                  const seatsLeft = ride.available_seats - ride.booked_seats;
                  const isBooking = bookingInProgress === ride.id;
                  return (
                    <View key={ride.id} style={styles.ridesModalCard}>
                      {/* Driver Row */}
                      <View style={styles.rmDriverRow}>
                        <View style={[styles.rmAvatar, { backgroundColor: '#4D9EFF' }]}>
                          <Text style={styles.rmAvatarText}>{ride.driver_name?.charAt(0).toUpperCase() || 'D'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rmDriverName}>{ride.driver_name}</Text>
                          <Text style={styles.rmVehicleType}>{ride.vehicle_type || 'Mini'}</Text>
                        </View>
                        <View style={styles.rmPriceBox}>
                          <Text style={styles.rmPrice}>PKR {ride.price_per_seat}</Text>
                          <Text style={styles.rmPriceLabel}>per seat</Text>
                        </View>
                      </View>

                      {/* Route */}
                      <View style={styles.rmRouteRow}>
                        <View style={styles.rmRouteDots}>
                          <View style={styles.rmPickupDot} />
                          <View style={styles.rmRouteLine} />
                          <View style={styles.rmDropoffDot} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rmRouteText} numberOfLines={1}>{ride.start_location?.name || 'Pickup'}</Text>
                          <View style={{ height: 10 }} />
                          <Text style={styles.rmRouteText} numberOfLines={1}>{ride.end_location?.name || 'Drop-off'}</Text>
                        </View>
                      </View>

                      {/* Meta */}
                      <View style={styles.rmMetaRow}>
                        <View style={styles.rmMeta}>
                          <Ionicons name="calendar-outline" size={12} color="#718096" />
                          <Text style={styles.rmMetaText}>{ride.ride_date}</Text>
                        </View>
                        <View style={styles.rmMeta}>
                          <Ionicons name="time-outline" size={12} color="#718096" />
                          <Text style={styles.rmMetaText}>{ride.ride_time}</Text>
                        </View>
                        <View style={styles.rmMeta}>
                          <Ionicons name="person-outline" size={12} color="#718096" />
                          <Text style={styles.rmMetaText}>{seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left</Text>
                        </View>
                      </View>

                      {/* Book Button */}
                      <TouchableOpacity
                        style={[styles.rmBookButton, (isBooking || seatsLeft === 0) && styles.rmBookButtonDisabled]}
                        onPress={() => { setShowRidesModal(false); handleBookRide(ride); }}
                        disabled={isBooking || seatsLeft === 0}
                      >
                        {isBooking
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <Text style={styles.rmBookButtonText}>{seatsLeft === 0 ? 'Fully Booked' : 'Book this Ride'}</Text>
                        }
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>


      {/* Sidebar Modal */}
      <Modal visible={sidebarVisible} transparent animationType="fade" onRequestClose={() => setSidebarVisible(false)}>
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity style={styles.sidebarBackdrop} activeOpacity={1} onPress={() => setSidebarVisible(false)} />
          <View style={styles.sidebarContainer}>
            <View style={styles.profileSection}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>{userProfile?.name?.charAt(0).toUpperCase() || "R"}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile?.name || "Rider"}</Text>
                <View style={styles.ratingContainer}>
                  {[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={16} color="#FFB800" />)}
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
              <TouchableOpacity><Ionicons name="chevron-forward" size={24} color="#666" /></TouchableOpacity>
            </View>
            <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
              {[
                { icon: "time-outline", label: "Request history" },
                { icon: "notifications-outline", label: "Notifications" },
                { icon: "shield-checkmark-outline", label: "Safety" },
                { icon: "settings-outline", label: "Settings" },
                { icon: "help-circle-outline", label: "Help" },
              ].map((item) => (
                <TouchableOpacity key={item.label} style={styles.menuItem}>
                  <Ionicons name={item.icon as any} size={24} color="#666" />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.sidebarDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
                <Text style={[styles.menuItemText, { color: "#FF6B6B" }]}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.driverModeContainer}>
              <TouchableOpacity style={styles.driverModeButton}
                onPress={async () => {
                  setSidebarVisible(false);
                  try {
                    const profile = await getProfile();
                    if (profile?.role === "driver") {
                      router.push("/driverMainScreen");
                    } else {
                      router.push("/selectrole");
                    }
                  } catch {
                    router.push("/selectrole");
                  }
                }}>
                <Text style={styles.driverModeText}>Driver mode</Text>
              </TouchableOpacity>
              <View style={styles.socialIcons}>
                <TouchableOpacity style={styles.socialIcon}>
                  <Ionicons name="logo-facebook" size={32} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <Ionicons name="logo-instagram" size={32} color="#E4405F" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Searching / Driver Found Modal */}
      {/* Floating indicator when modal is minimized but booking active */}
      {!showSearchModal && activeBooking?.status === 'pending' && (
        <TouchableOpacity style={styles.minimizedIndicator} onPress={() => setShowSearchModal(true)}>
          <View style={styles.minimizedDot} />
          <Text style={styles.minimizedText}>Searching for driver...</Text>
          <Ionicons name="chevron-up-outline" size={16} color="#4D9EFF" />
        </TouchableOpacity>
      )}

      {/* Searching / Driver Found Modal */}
      <SearchingModal
        visible={showSearchModal}
        booking={activeBooking}
        onCancel={handleCancelBooking}
        onConfirm={handleConfirmOrDismiss}
        onMinimize={handleMinimize}
      />

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#4D9EFF" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="heart-outline" size={24} color="#666" />
          <Text style={styles.navText}>Favourite</Text>
        </TouchableOpacity>
        <View style={styles.navItemCenter}>
          <View style={styles.walletButton}>
            <Ionicons name="wallet-outline" size={28} color="#fff" />
          </View>
          <Text style={styles.navText}>Wallet</Text>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="pricetag-outline" size={24} color="#666" />
          <Text style={styles.navText}>Offer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RiderHomeScreen;

// ── SEARCHING MODAL STYLES ─────────────────────────────────────────────────
const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 20,
  },
  handle: { width: 40, height: 4, backgroundColor: "#E2E8F0", borderRadius: 2, alignSelf: "center", marginBottom: 24 },

  // Pulse
  pulseContainer: { alignItems: "center", justifyContent: "center", height: 140, marginBottom: 16 },
  pulseRing: {
    position: "absolute", width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#4D9EFF",
  },
  pulseCenter: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: "#4D9EFF",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#4D9EFF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  searchingTitle: { fontSize: 20, fontWeight: "700", color: "#1a202c", textAlign: "center", marginBottom: 6 },
  searchingSubtitle: { fontSize: 14, color: "#718096", textAlign: "center", marginBottom: 20 },

  // Pending info box
  pendingInfo: {
    backgroundColor: "#F7FAFC", borderRadius: 14, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  pendingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pendingDash: { width: 1.5, height: 14, backgroundColor: "#CBD5E0", marginLeft: 6, marginVertical: 3 },
  pendingText: { flex: 1, fontSize: 13, color: "#2D3748", fontWeight: "600" },
  pendingMeta: { marginTop: 8 },
  pendingMetaText: { fontSize: 12, color: "#718096" },

  cancelBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14,
    borderWidth: 2, borderColor: "#FF6B6B", backgroundColor: "#FFF5F5",
  },
  cancelBtnText: { fontSize: 15, fontWeight: "700", color: "#FF6B6B" },
  actionRow: { flexDirection: "row", gap: 10 },
  minimizeBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, borderRadius: 14,
    borderWidth: 2, borderColor: "#4D9EFF", backgroundColor: "#F0F7FF",
  },
  minimizeBtnText: { fontSize: 15, fontWeight: "700", color: "#4D9EFF" },

  // Success / Rejected
  successHeader: { alignItems: "center", marginBottom: 20 },
  successIconWrap: { marginBottom: 10 },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#1a202c", marginBottom: 4 },
  successSubtitle: { fontSize: 14, color: "#718096", textAlign: "center" },

  // Driver card
  driverCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#F0F7FF", borderRadius: 14, padding: 14, marginBottom: 12,
  },
  driverLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  driverAvatar: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center" },
  driverInitial: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  driverName: { fontSize: 16, fontWeight: "700", color: "#2A66B5" },
  starsRow: { flexDirection: "row", gap: 2, marginTop: 2 },
  driverPhone: { fontSize: 12, color: "#718096", marginTop: 2 },
  driverRight: {},

  // Vehicle card
  vehicleCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#F7FAFC", borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  vehicleInfo: { flex: 1 },
  vehicleTitle: { fontSize: 14, fontWeight: "600", color: "#2D3748" },
  vehiclePlate: { fontSize: 12, color: "#718096", marginTop: 2 },
  vehicleTypeBadge: { backgroundColor: "#4D9EFF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  vehicleTypeText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  // Route summary
  routeSummary: {
    backgroundColor: "#F7FAFC", borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  routeDotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#4CAF50" },
  routeDotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF6B6B" },
  routeVertLine: { width: 2, height: 14, backgroundColor: "#CBD5E0", marginLeft: 4, marginVertical: 3 },
  routeText: { flex: 1, fontSize: 13, color: "#2D3748", fontWeight: "600" },

  // Fare row
  fareRow: {
    flexDirection: "row", backgroundColor: "#F0F7FF",
    borderRadius: 14, padding: 14, marginBottom: 20,
  },
  fareItem: { flex: 1, alignItems: "center" },
  fareDivider: { width: 1, backgroundColor: "#CBD5E0", marginVertical: 4 },
  fareLabel: { fontSize: 11, color: "#718096", marginBottom: 4 },
  fareValue: { fontSize: 14, fontWeight: "700", color: "#2D3748" },
  fareValueBlue: { fontSize: 14, fontWeight: "700", color: "#4D9EFF" },

  confirmBtn: {
    backgroundColor: "#4D9EFF", paddingVertical: 16, borderRadius: 14, alignItems: "center",
    shadowColor: "#4D9EFF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  confirmBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
});

// ── MAIN SCREEN STYLES ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingText: { marginTop: 20, fontSize: 16, color: "#666" },
  map: { flex: 1 },
  currentLocationMarker: { width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(77, 158, 255, 0.3)", justifyContent: "center", alignItems: "center" },
  markerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#4D9EFF", borderWidth: 2, borderColor: "#fff" },
  header: { position: "absolute", top: 50, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  menuButton: { width: 50, height: 50, backgroundColor: "#4D9EFF", borderRadius: 12, justifyContent: "center", alignItems: "center", elevation: 5 },
  menuIcon: { width: 24, height: 18, justifyContent: "space-between" },
  menuLine: { width: "100%", height: 3, backgroundColor: "#fff", borderRadius: 2 },
  notificationButton: { width: 50, height: 50, backgroundColor: "#fff", borderRadius: 25, justifyContent: "center", alignItems: "center", elevation: 3 },
  centerLocationButton: { position: "absolute", top: 380, right: 20, width: 55, height: 55, backgroundColor: "#fff", borderRadius: 12, justifyContent: "center", alignItems: "center", elevation: 3 },
  vehicleContainer: { marginBottom: 15 },
  vehicleScrollContent: { gap: 10 },
  vehicleOption: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10, alignItems: "center", minWidth: 80, borderWidth: 1.5, borderColor: "#E0E0E0" },
  vehicleOptionActive: { backgroundColor: "#4D9EFF", borderColor: "#4D9EFF" },
  vehicleIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EBF5FF", justifyContent: "center", alignItems: "center", marginBottom: 6 },
  vehicleLabel: { fontSize: 12, fontWeight: "600", color: "#333", marginBottom: 3 },
  vehicleLabelActive: { color: "#fff" },
  passengerInfo: { flexDirection: "row", alignItems: "center", gap: 3 },
  passengerText: { fontSize: 10, color: "#999", fontWeight: "500" },
  passengerTextActive: { color: "#fff" },
  bottomSection: { position: "absolute", bottom: 100, left: 20, right: 6, backgroundColor: "#d4e2ebff", borderRadius: 20, padding: 25, borderWidth: 2, borderColor: "#4D9EFF", elevation: 8 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 15, gap: 10 },
  searchIcon: { marginRight: 5 },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },
  suggestionsContainer: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 15, maxHeight: 200, overflow: "hidden", elevation: 3 },
  suggestionsList: { maxHeight: 200 },
  suggestionItem: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  suggestionText: { flex: 1, fontSize: 14, color: "#333" },
  ridesSection: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 15, maxHeight: 240, overflow: "hidden" },
  ridesSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  ridesSectionTitle: { fontSize: 14, fontWeight: "700", color: "#2D3748" },
  ridesList: { maxHeight: 190 },
  rideCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  rideCardLeft: { flex: 1, marginRight: 10 },
  rideRouteRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  routeIndicators: { alignItems: "center", marginRight: 8, paddingTop: 2 },
  pickupDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4D9EFF" },
  routeDashLine: { width: 1.5, height: 14, backgroundColor: "#CBD5E0", marginVertical: 2 },
  dropoffDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF6B6B" },
  routeTextCol: { flex: 1 },
  rideRouteText: { fontSize: 13, color: "#2D3748", fontWeight: "600" },
  rideMetaRow: { flexDirection: "row", gap: 10, marginBottom: 4, flexWrap: "wrap" },
  rideMeta: { flexDirection: "row", alignItems: "center", gap: 3 },
  rideMetaText: { fontSize: 11, color: "#718096" },
  driverName: { fontSize: 11, color: "#4D9EFF", marginTop: 2 },
  rideCardRight: { alignItems: "center", gap: 4, minWidth: 70 },
  ridePrice: { fontSize: 15, fontWeight: "700", color: "#2D3748" },
  ridePriceLabel: { fontSize: 10, color: "#718096", marginTop: -2 },
  bookButton: { backgroundColor: "#4D9EFF", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, minWidth: 60, alignItems: "center" },
  bookButtonDisabled: { backgroundColor: "#A0AEC0" },
  bookButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  noRidesContainer: { alignItems: "center", padding: 20, gap: 8 },
  noRidesText: { fontSize: 14, color: "#A0AEC0" },
  // ── FIND RIDE BUTTON ─────────────────────────────────
  findRideButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#4D9EFF", paddingVertical: 16, borderRadius: 14,
    shadowColor: "#4D9EFF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  findRideButtonDim: { backgroundColor: "#A0C4FF" },
  findRideButtonText: { fontSize: 17, fontWeight: "800", color: "#fff" },

  // ── RIDES MODAL ───────────────────────────────────────
  ridesModalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  ridesModalBackdrop: { flex: 1 },
  ridesModalSheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: "80%", paddingBottom: 30,
  },
  ridesModalHandle: { width: 40, height: 4, backgroundColor: "#E2E8F0", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 4 },
  ridesModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  ridesModalTitle: { fontSize: 18, fontWeight: "700", color: "#1a202c" },
  ridesModalLoading: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  ridesModalLoadingText: { fontSize: 15, color: "#718096" },
  ridesModalEmpty: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10, paddingHorizontal: 30 },
  ridesModalEmptyTitle: { fontSize: 17, fontWeight: "700", color: "#2D3748" },
  ridesModalEmptyText: { fontSize: 14, color: "#A0AEC0", textAlign: "center" },
  ridesModalList: { paddingHorizontal: 16, paddingTop: 8 },

  // ── RIDE MODAL CARD ───────────────────────────────────
  ridesModalCard: {
    backgroundColor: "#F7FAFC", borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  rmDriverRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  rmAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
  rmAvatarText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  rmDriverName: { fontSize: 15, fontWeight: "700", color: "#1a202c" },
  rmVehicleType: { fontSize: 12, color: "#718096", marginTop: 2 },
  rmPriceBox: { alignItems: "flex-end" },
  rmPrice: { fontSize: 17, fontWeight: "800", color: "#4D9EFF" },
  rmPriceLabel: { fontSize: 11, color: "#718096" },
  rmRouteRow: { flexDirection: "row", alignItems: "stretch", gap: 10, marginBottom: 12 },
  rmRouteDots: { alignItems: "center", paddingTop: 3 },
  rmPickupDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#4CAF50" },
  rmRouteLine: { width: 2, flex: 1, backgroundColor: "#CBD5E0", marginVertical: 3, minHeight: 16 },
  rmDropoffDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF6B6B" },
  rmRouteText: { fontSize: 13, fontWeight: "600", color: "#2D3748" },
  rmMetaRow: { flexDirection: "row", gap: 14, marginBottom: 14, flexWrap: "wrap" },
  rmMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  rmMetaText: { fontSize: 12, color: "#718096" },
  rmBookButton: {
    backgroundColor: "#4D9EFF", paddingVertical: 14, borderRadius: 12, alignItems: "center",
    shadowColor: "#4D9EFF", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  rmBookButtonDisabled: { backgroundColor: "#A0AEC0" },
  rmBookButtonText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  bottomNav: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", paddingBottom: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#E0E0E0", elevation: 10 },
  navItem: { alignItems: "center", gap: 4 },
  navItemCenter: { alignItems: "center", marginTop: -25 },
  walletButton: { width: 60, height: 60, backgroundColor: "#4D9EFF", borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 5, elevation: 8 },
  navText: { fontSize: 12, color: "#666" },
  navTextActive: { fontSize: 12, color: "#4D9EFF", fontWeight: "600" },
  sidebarOverlay: { flex: 1, flexDirection: "row" },
  sidebarBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" },
  sidebarContainer: { width: "75%", backgroundColor: "#fff", paddingTop: 60, paddingBottom: 20 },
  profileSection: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  profileAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFD4E5", justifyContent: "center", alignItems: "center", marginRight: 15 },
  profileInitial: { fontSize: 28, fontWeight: "600", color: "#FF6B9D" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: "600", color: "#333", marginBottom: 5 },
  ratingContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 14, color: "#666", marginLeft: 8 },
  menuItems: { flex: 1, paddingTop: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, gap: 20 },
  menuItemText: { fontSize: 16, color: "#333" },
  driverModeContainer: { paddingHorizontal: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  driverModeButton: { backgroundColor: "#4D9EFF", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 20 },
  driverModeText: { fontSize: 18, fontWeight: "600", color: "white" },
  socialIcons: { flexDirection: "row", justifyContent: "center", gap: 30 },
  socialIcon: { width: 50, height: 50, justifyContent: "center", alignItems: "center" },
  // Minimized indicator bar
  minimizedIndicator: {
    position: "absolute", bottom: 110, left: 20, right: 20,
    backgroundColor: "#fff", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", gap: 10,
    shadowColor: "#4D9EFF", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
    borderWidth: 1.5, borderColor: "#4D9EFF",
  },
  minimizedDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#4D9EFF" },
  sidebarDivider: { height: 1, backgroundColor: "#F0F0F0", marginHorizontal: 20, marginVertical: 4 },
  minimizedText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#2D3748" },
});