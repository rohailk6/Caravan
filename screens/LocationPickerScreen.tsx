import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const LocationPickerScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { locationType } = params; 

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please enable location permissions");
        const defaultLocation = { latitude: 33.6844, longitude: 73.0479, latitudeDelta: 0.05, longitudeDelta: 0.05 };
        setCurrentLocation(defaultLocation);
        setSelectedLocation({ latitude: 33.6844, longitude: 73.0479 });
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setCurrentLocation(currentCoords);
      setSelectedLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      getAddressFromCoordinates(location.coords.latitude, location.coords.longitude);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addressResponse && addressResponse.length > 0) {
        const address = addressResponse[0];
        const formattedAddress = [address.name, address.street, address.city].filter(Boolean).join(", ");
        setLocationName(formattedAddress || "Selected Location");
      }
    } catch (error) {
      setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    getAddressFromCoordinates(coordinate.latitude, coordinate.longitude);
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert("No Location", "Please tap on the map");
      return;
    }

    // FIX: Spread previous params to keep the "other" location and car details
    router.push({
      pathname: "/postRideDetails",
      params: {
        ...params,
        [`${locationType}Location`]: locationName,
        [`${locationType}Latitude`]: selectedLocation.latitude.toString(),
        [`${locationType}Longitude`]: selectedLocation.longitude.toString(),
      },
    });
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4D9EFF" /></View>;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{locationType === "start" ? "Starting Point" : "Destination"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <MapView style={styles.map} initialRegion={currentLocation} onPress={handleMapPress} showsUserLocation>
        {selectedLocation && <Marker coordinate={selectedLocation} pinColor="#4D9EFF" />}
      </MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
          <Text style={styles.confirmButtonText}>CONFIRM LOCATION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ... keep your existing styles

export default LocationPickerScreen;

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#fff",
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 4,
    fontSize: 16,
    color: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSpacer: {
    width: 60,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  confirmButton: {
    backgroundColor: "#4D9EFF",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  infoCard: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4D9EFF",
    marginBottom: 4,
  },
  infoAddress: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  instructionsCard: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: "#FFF9E6",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FFE4A3",
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: "#8B7355",
  },
});