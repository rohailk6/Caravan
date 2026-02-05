import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

const PostRideDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [startLocation, setStartLocation] = useState("");
  const [finishLocation, setFinishLocation] = useState("");
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [finishCoordinates, setFinishCoordinates] = useState(null);
  const [availableSeats, setAvailableSeats] = useState("");
  const [showSeatsModal, setShowSeatsModal] = useState(false);

  const seatOptions = ["1", "2", "3", "4", "5", "6", "7"];

  // Update locations when returning from map picker
  useEffect(() => {
    // Handle Start Location update
    if (params.startLocation && params.startLocation !== startLocation) {
      setStartLocation(params.startLocation as string);
      if (params.startLatitude && params.startLongitude) {
        setStartCoordinates({
          latitude: parseFloat(params.startLatitude as string),
          longitude: parseFloat(params.startLongitude as string),
        });
      }
    }

    // Handle Finish Location update
    if (params.finishLocation && params.finishLocation !== finishLocation) {
      setFinishLocation(params.finishLocation as string);
      if (params.finishLatitude && params.finishLongitude) {
        setFinishCoordinates({
          latitude: parseFloat(params.finishLatitude as string),
          longitude: parseFloat(params.finishLongitude as string),
        });
      }
    }
  }, [params.startLocation, params.finishLocation, params.startLatitude, params.finishLatitude]);

  const handleSelectSeats = (seats) => {
    setAvailableSeats(seats);
    setShowSeatsModal(false);
  };

  const handleOpenMap = (locationType) => {
    router.push({
      pathname: "/locationPicker",
      params: {
        ...params, // Spread existing car details
        locationType,
        // Send current state to picker to ensure nothing is lost during the round trip
        startLocation,
        finishLocation,
        startLatitude: startCoordinates?.latitude?.toString(),
        startLongitude: startCoordinates?.longitude?.toString(),
        finishLatitude: finishCoordinates?.latitude?.toString(),
        finishLongitude: finishCoordinates?.longitude?.toString(),
      },
    });
  };

  const handleNext = () => {
    if (startLocation && finishLocation && availableSeats) {
      console.log("Complete Ride Details:", {
        vehicleDetails: {
          carName: params.carName,
          carModel: params.carModel,
          numberPlate: params.numberPlate,
          carColor: params.carColor,
        },
        rideDetails: {
          startLocation,
          startCoordinates,
          finishLocation,
          finishCoordinates,
          availableSeats,
        },
      });

      alert("Ride posted successfully!");
      router.push("/selectrole");
    } else {
      alert("Please fill in all ride details");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Post Ride</Text>

        {/* Ride Details Section */}
        <Text style={styles.sectionTitle}>Ride Details</Text>

        {/* Starting Location */}
        <View style={styles.locationInputContainer}>
          <TextInput
            style={[styles.locationInput, startLocation && styles.locationInputFilled]}
            placeholder="Search Starting Location"
            placeholderTextColor="#8DD3FF"
            value={startLocation}
            onChangeText={setStartLocation}
            editable={true}
          />
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => handleOpenMap("start")}
          >
            <Ionicons name="location" size={20} color="#4D9EFF" />
            <Text style={styles.mapButtonText}>Pick on Map</Text>
          </TouchableOpacity>
        </View>

        {/* Finish Location */}
        <View style={styles.locationInputContainer}>
          <TextInput
            style={[styles.locationInput, finishLocation && styles.locationInputFilled]}
            placeholder="Search Finish Location"
            placeholderTextColor="#8DD3FF"
            value={finishLocation}
            onChangeText={setFinishLocation}
            editable={true}
          />
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => handleOpenMap("finish")}
          >
            <Ionicons name="location" size={20} color="#4D9EFF" />
            <Text style={styles.mapButtonText}>Pick on Map</Text>
          </TouchableOpacity>
        </View>

        {/* Available Seats Dropdown */}
        <TouchableOpacity
          style={styles.seatsInput}
          onPress={() => setShowSeatsModal(true)}
        >
          <View style={styles.seatsContent}>
            <Text
              style={[
                styles.seatsText,
                !availableSeats && styles.placeholderText,
              ]}
            >
              {availableSeats ? `${availableSeats} Seat${availableSeats !== "1" ? "s" : ""}` : "Available Seats"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={24}
              color="#4D9EFF"
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Next Button - Fixed at Bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>POST RIDE</Text>
        </TouchableOpacity>
      </View>

      {/* Seats Selection Modal */}
      <Modal
        visible={showSeatsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSeatsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSeatsModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Available Seats</Text>
            {seatOptions.map((seat) => (
              <TouchableOpacity
                key={seat}
                style={styles.modalOption}
                onPress={() => handleSelectSeats(seat)}
              >
                <Text style={styles.modalOptionText}>
                  {seat} Seat{seat !== "1" ? "s" : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default PostRideDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 30,
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
  title: {
    fontSize: 32,
    fontWeight: "500",
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "500",
    color: "#4D9EFF",
    marginBottom: 25,
  },
  locationInputContainer: {
    marginBottom: 20,
  },
  locationInput: {
    borderWidth: 1.5,
    borderColor: "#4D9EFF",
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#4D9EFF",
    marginBottom: 10,
  },
  locationInputFilled: {
    backgroundColor: "#F0F8FF",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#E8F4FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4D9EFF",
  },
  mapButtonText: {
    fontSize: 14,
    color: "#4D9EFF",
    fontWeight: "600",
  },
  seatsInput: {
    borderWidth: 1.5,
    borderColor: "#4D9EFF",
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  seatsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seatsText: {
    fontSize: 16,
    color: "#4D9EFF",
  },
  placeholderText: {
    color: "#8DD3FF",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  nextButton: {
    backgroundColor: "#4D9EFF",
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#4D9EFF",
    textAlign: "center",
  },
});