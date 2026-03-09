import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { bookRide, getProfile, searchRides } from "../api"; // ← import api

const RiderHomeScreen = () => {
  const router = useRouter();
  const mapRef = React.useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("transport");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("mini");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // ── NEW STATE ─────────────────────────────────────────────
  const [availableRides, setAvailableRides] = useState([]);  // rides from backend
  const [ridesLoading, setRidesLoading] = useState(false);   // loading rides
  const [showRides, setShowRides] = useState(false);         // show rides panel
  const [bookingId, setBookingId] = useState(null);          // after booking
  const [userProfile, setUserProfile] = useState(null);      // logged in user

  useEffect(() => {
    getCurrentLocation();
    loadProfile();       // ← load user profile on mount
    fetchAvailableRides(); // ← load rides on mount
  }, []);

  // Reload rides when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAvailableRides();
    }, [])
  );

  // ── LOAD USER PROFILE ─────────────────────────────────────
  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.log("Could not load profile");
    }
  };

  // ── FETCH RIDES FROM BACKEND ──────────────────────────────
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

  // ── BOOK A RIDE ───────────────────────────────────────────
  const handleBookRide = async (rideId: string) => {
    Alert.alert(
      "Confirm Booking",
      "Do you want to book 1 seat on this ride?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book",
          onPress: async () => {
            try {
              const response = await bookRide(rideId, 1);
              Alert.alert(
                "🎉 Booking Sent!",
                "Your booking request has been sent to the driver. You'll be notified when they accept."
              );
              fetchAvailableRides(); // refresh rides
            } catch (error: any) {
              Alert.alert(
                "Booking Failed",
                error.response?.data?.detail || "Could not book ride."
              );
            }
          },
        },
      ]
    );
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCurrentLocation({ latitude: 33.6844, longitude: 73.0479, latitudeDelta: 0.05, longitudeDelta: 0.05 });
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
      setCurrentLocation({ latitude: 33.6844, longitude: 73.0479, latitudeDelta: 0.05, longitudeDelta: 0.05 });
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
        { headers: { 'User-Agent': 'Carvaan-App' } }
      );
      const data = await response.json();
      setSuggestions(data.map((item) => ({
        id: item.place_id,
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      })));
      setShowSuggestions(true);
    } catch (error) {
      setSuggestions([]);
    }
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
    setShowRides(true); // ← show rides panel when destination selected

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
      if (data.routes && data.routes.length > 0) {
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
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={currentLocation}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {currentLocation && (
          <>
            <Marker
              coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.markerDot} />
              </View>
            </Marker>
            <Circle center={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
              radius={1000} fillColor="rgba(77, 158, 255, 0.1)" strokeColor="rgba(77, 158, 255, 0.3)" strokeWidth={2} />
            <Circle center={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
              radius={2000} fillColor="rgba(77, 158, 255, 0.05)" strokeColor="rgba(77, 158, 255, 0.2)" strokeWidth={1} />
          </>
        )}
        {destinationLocation && (
          <Marker coordinate={destinationLocation} pinColor="#FF6B6B" title="Destination" />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="#4D9EFF" strokeWidth={4} />
        )}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarVisible(true)}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Center Location Button */}
      <TouchableOpacity style={styles.centerLocationButton} onPress={handleCenterLocation}>
        <Ionicons name="locate" size={24} color="#333" />
      </TouchableOpacity>

      {/* Bottom Search Section */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
        <View style={styles.bottomSection}>

          {/* Vehicle Options */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleContainer} contentContainerStyle={styles.vehicleScrollContent}>
            {vehicleOptions.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[styles.vehicleOption, selectedVehicle === vehicle.id && styles.vehicleOptionActive]}
                onPress={() => setSelectedVehicle(vehicle.id)}
              >
                <View style={styles.vehicleIconContainer}>
                  <Ionicons name={vehicle.icon} size={24} color={selectedVehicle === vehicle.id ? "#fff" : "#4D9EFF"} />
                </View>
                <Text style={[styles.vehicleLabel, selectedVehicle === vehicle.id && styles.vehicleLabelActive]}>
                  {vehicle.label}
                </Text>
                <View style={styles.passengerInfo}>
                  <Ionicons name="person" size={10} color={selectedVehicle === vehicle.id ? "#4D9EFF" : "#999"} />
                  <Text style={[styles.passengerText, selectedVehicle === vehicle.id && styles.passengerTextActive]}>
                    {vehicle.passengers}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Where would you go?"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearchChange}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            />
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                {suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion.id}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(suggestion)}
                  >
                    <Ionicons name="location-outline" size={20} color="#4D9EFF" />
                    <Text style={styles.suggestionText} numberOfLines={2}>{suggestion.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── AVAILABLE RIDES FROM BACKEND ───────────────── */}
          {showRides && (
            <View style={styles.ridesSection}>
              <View style={styles.ridesSectionHeader}>
                <Text style={styles.ridesSectionTitle}>
                  Available Rides ({availableRides.length})
                </Text>
                {ridesLoading && <ActivityIndicator size="small" color="#4D9EFF" />}
              </View>

              {availableRides.length === 0 && !ridesLoading ? (
                <View style={styles.noRidesContainer}>
                  <Ionicons name="car-outline" size={30} color="#CBD5E0" />
                  <Text style={styles.noRidesText}>No rides available right now</Text>
                </View>
              ) : (
                <ScrollView style={styles.ridesList} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                  {availableRides.map((ride: any) => (
                    <View key={ride.id} style={styles.rideCard}>
                      <View style={styles.rideCardLeft}>
                        <View style={styles.rideRoute}>
                          <Ionicons name="radio-button-on" size={14} color="#4D9EFF" />
                          <Text style={styles.rideRouteText} numberOfLines={1}>
                            {ride.start_location?.name}
                          </Text>
                        </View>
                        <View style={styles.routeDash} />
                        <View style={styles.rideRoute}>
                          <Ionicons name="location" size={14} color="#FF6B6B" />
                          <Text style={styles.rideRouteText} numberOfLines={1}>
                            {ride.end_location?.name}
                          </Text>
                        </View>
                        <Text style={styles.rideInfo}>
                          {ride.ride_date} • {ride.ride_time} • {ride.available_seats - ride.booked_seats} seats left
                        </Text>
                      </View>

                      <View style={styles.rideCardRight}>
                        <Text style={styles.ridePrice}>PKR {ride.price_per_seat}</Text>
                        <TouchableOpacity
                          style={styles.bookButton}
                          onPress={() => handleBookRide(ride.id)}
                        >
                          <Text style={styles.bookButtonText}>Book</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Transport/Delivery Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "transport" && styles.tabActive]}
              onPress={() => { setSelectedTab("transport"); setShowRides(true); fetchAvailableRides(); }}
            >
              <Text style={[styles.tabText, selectedTab === "transport" && styles.tabTextActive]}>Transport</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "delivery" && styles.tabActive]}
              onPress={() => setSelectedTab("delivery")}
            >
              <Text style={[styles.tabText, selectedTab === "delivery" && styles.tabTextActive]}>Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Sidebar */}
      <Modal visible={sidebarVisible} transparent={true} animationType="fade" onRequestClose={() => setSidebarVisible(false)}>
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity style={styles.sidebarBackdrop} activeOpacity={1} onPress={() => setSidebarVisible(false)} />
          <View style={styles.sidebarContainer}>
            {/* Profile */}
            <View style={styles.profileSection}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>
                  {userProfile?.name?.charAt(0).toUpperCase() || "R"}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile?.name || "Rider"}</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Ionicons key={i} name="star" size={16} color="#FFB800" />
                  ))}
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="time-outline" size={24} color="#666" />
                <Text style={styles.menuItemText}>Request history</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="notifications-outline" size={24} color="#666" />
                <Text style={styles.menuItemText}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#666" />
                <Text style={styles.menuItemText}>Safety</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="settings-outline" size={24} color="#666" />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="help-circle-outline" size={24} color="#666" />
                <Text style={styles.menuItemText}>Help</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Driver Mode */}
            <View style={styles.driverModeContainer}>
              <TouchableOpacity
                style={styles.driverModeButton}
                onPress={() => { setSidebarVisible(false); router.push('/selectrole'); }}
              >
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

  // ── RIDES SECTION ─────────────────────────────────────────
  ridesSection: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 15, maxHeight: 220, overflow: "hidden" },
  ridesSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  ridesSectionTitle: { fontSize: 14, fontWeight: "700", color: "#2D3748" },
  ridesList: { maxHeight: 170 },
  rideCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  rideCardLeft: { flex: 1, marginRight: 10 },
  rideRoute: { flexDirection: "row", alignItems: "center", gap: 6 },
  routeDash: { width: 2, height: 12, backgroundColor: "#E2E8F0", marginLeft: 6, marginVertical: 2 },
  rideRouteText: { fontSize: 13, color: "#2D3748", fontWeight: "600", flex: 1 },
  rideInfo: { fontSize: 11, color: "#718096", marginTop: 4 },
  rideCardRight: { alignItems: "center", gap: 6 },
  ridePrice: { fontSize: 14, fontWeight: "700", color: "#2D3748" },
  bookButton: { backgroundColor: "#4D9EFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  bookButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  noRidesContainer: { alignItems: "center", padding: 20, gap: 8 },
  noRidesText: { fontSize: 14, color: "#A0AEC0" },

  tabsContainer: { flexDirection: "row", gap: 10 },
  tab: { flex: 1, backgroundColor: "#fff", paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  tabActive: { backgroundColor: "#4D9EFF" },
  tabText: { fontSize: 16, fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#fff" },
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
});