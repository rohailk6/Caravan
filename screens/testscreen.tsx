import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Circle, Marker, Polyline } from "react-native-maps";

const RiderHomeScreen = () => {
  const router = useRouter();
  const mapRef = React.useRef(null);
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("transport"); // "transport" or "delivery"
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("mini");

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        // Default to Islamabad if permission denied
        const defaultLocation = {
          latitude: 33.6844,
          longitude: 73.0479,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setCurrentLocation(defaultLocation);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      
      setCurrentLocation(coords);
      setLoading(false);
    } catch (error) {
      console.error("Error getting location:", error);
      const defaultLocation = {
        latitude: 33.6844,
        longitude: 73.0479,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setCurrentLocation(defaultLocation);
      setLoading(false);
    }
  };

  const handleCenterLocation = () => {
    getCurrentLocation();
  };

  const vehicleOptions = [
    { id: "mini", icon: "car-outline", label: "Mini", passengers: 4 },
    { id: "moto", icon: "bicycle-outline", label: "Moto", passengers: 1 },
    { id: "rideac", icon: "car-sport-outline", label: "Ride A/C", passengers: 4 },
    { id: "city", icon: "briefcase-outline", label: "City", passengers: 4 },
  ];

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicle(vehicleId);
  };

  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Using Nominatim (OpenStreetMap) - FREE, no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=pk&limit=5`,
        {
          headers: {
            'User-Agent': 'Carvaan-App', // Required by Nominatim
          },
        }
      );

      const data = await response.json();
      
      const formattedSuggestions = data.map((item) => ({
        id: item.place_id,
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));

      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching location:", error);
      setSuggestions([]);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search (debounce)
    const timeout = setTimeout(() => {
      searchLocation(text);
    }, 500); // Wait 500ms after user stops typing

    setSearchTimeout(timeout);
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();

    const destination = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    };

    setDestinationLocation(destination);

    // Get route from current location to destination
    getRoute(currentLocation, destination);

    // Animate map to show both locations
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
          destination,
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        }
      );
    }
  };

  const getRoute = async (start, end) => {
    try {
      // Using OSRM (Open Source Routing Machine) - FREE
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        setRouteCoordinates(coordinates);
      }
    } catch (error) {
      console.error("Error getting route:", error);
      // Fallback: draw straight line if routing fails
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
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.markerDot} />
              </View>
            </Marker>
            
            {/* Circular radius around current location */}
            <Circle
              center={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              radius={1000}
              fillColor="rgba(77, 158, 255, 0.1)"
              strokeColor="rgba(77, 158, 255, 0.3)"
              strokeWidth={2}
            />
            <Circle
              center={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              radius={2000}
              fillColor="rgba(77, 158, 255, 0.05)"
              strokeColor="rgba(77, 158, 255, 0.2)"
              strokeWidth={1}
            />
          </>
        )}

        {/* Destination Marker */}
        {destinationLocation && (
          <Marker
            coordinate={destinationLocation}
            pinColor="#FF6B6B"
            title="Destination"
          />
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#4D9EFF"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
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
      <TouchableOpacity 
        style={styles.centerLocationButton}
        onPress={handleCenterLocation}
      >
        <Ionicons name="locate" size={24} color="#333" />
      </TouchableOpacity>

      {/* Search and Transport/Delivery Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.bottomSection}>
          {/* Vehicle Selection */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.vehicleContainer}
            contentContainerStyle={styles.vehicleScrollContent}
          >
            {vehicleOptions.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleOption,
                  selectedVehicle === vehicle.id && styles.vehicleOptionActive,
                ]}
                onPress={() => handleVehicleSelect(vehicle.id)}
              >
                <View style={styles.vehicleIconContainer}>
                  <Ionicons
                    name={vehicle.icon}
                    size={24}
                    color={selectedVehicle === vehicle.id ? "#fff" : "#4D9EFF"}
                  />
                </View>
                <Text
                  style={[
                    styles.vehicleLabel,
                    selectedVehicle === vehicle.id && styles.vehicleLabelActive,
                  ]}
                >
                  {vehicle.label}
                </Text>
                <View style={styles.passengerInfo}>
                  <Ionicons
                    name="person"
                    size={10}
                    color={selectedVehicle === vehicle.id ? "#4D9EFF" : "#999"}
                  />
                  <Text
                    style={[
                      styles.passengerText,
                      selectedVehicle === vehicle.id && styles.passengerTextActive,
                    ]}
                  >
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
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView 
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(suggestion)}
                >
                  <Ionicons name="location-outline" size={20} color="#4D9EFF" />
                  <Text style={styles.suggestionText} numberOfLines={2}>
                    {suggestion.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Transport/Delivery Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "transport" && styles.tabActive]}
            onPress={() => setSelectedTab("transport")}
          >
            <Text style={[styles.tabText, selectedTab === "transport" && styles.tabTextActive]}>
              Transport
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === "delivery" && styles.tabActive]}
            onPress={() => setSelectedTab("delivery")}
          >
            <Text style={[styles.tabText, selectedTab === "delivery" && styles.tabTextActive]}>
              Delivery
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  map: {
    flex: 1,
  },
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(77, 158, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4D9EFF",
    borderWidth: 2,
    borderColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuButton: {
    width: 50,
    height: 50,
    backgroundColor: "#4D9EFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuIcon: {
    width: 24,
    height: 18,
    justifyContent: "space-between",
  },
  menuLine: {
    width: "100%",
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  notificationButton: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerLocationButton: {
    position: "absolute",
    top: 380,
    right: 20,
    width: 55,
    height: 55,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleContainer: {
    marginBottom: 15,
  },
  vehicleScrollContent: {
    gap: 10,
  },
  vehicleOption: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  vehicleOptionActive: {
    backgroundColor: "#4D9EFF",
    borderColor: "#4D9EFF",
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  vehicleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  vehicleLabelActive: {
    color: "#fff",
  },
  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  passengerText: {
    fontSize: 10,
    color: "#999",
    fontWeight: "500",
  },
  passengerTextActive: {
    color: "#fff",
  },
  bottomSection: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 6,
    backgroundColor: "#d4e2ebff",
    borderRadius: 20,
    padding: 25,
    borderWidth: 2,
    borderColor: "#4D9EFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    gap: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    maxHeight: 200,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#4D9EFF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#fff",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navItemCenter: {
    alignItems: "center",
    marginTop: -25,
  },
  walletButton: {
    width: 60,
    height: 60,
    backgroundColor: "#4D9EFF",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  navText: {
    fontSize: 12,
    color: "#666",
  },
  navTextActive: {
    fontSize: 12,
    color: "#4D9EFF",
    fontWeight: "600",
  },
});