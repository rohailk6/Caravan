import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const PostRideVehicleScreen = () => {
  const router = useRouter();
  
  const [carName, setCarName] = useState("");
  const [carModel, setCarModel] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [carColor, setCarColor] = useState("");

  const handleNext = () => {
    // Validate inputs if needed
    if (carName && carModel && numberPlate && carColor) {
      // Navigate to the Ride Details screen
      router.push({
        pathname: "/postRideDetails",
        params: {
          carName,
          carModel,
          numberPlate,
          carColor,
        },
      });
    } else {
      alert("Please fill in all vehicle details");
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

        {/* Vehicle Details Section */}
        <Text style={styles.sectionTitle}>Vehicle Details</Text>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Car Name"
            placeholderTextColor="#8DD3FF"
            value={carName}
            onChangeText={setCarName}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter Car Model"
            placeholderTextColor="#8DD3FF"
            value={carModel}
            onChangeText={setCarModel}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter Number Plate"
            placeholderTextColor="#8DD3FF"
            value={numberPlate}
            onChangeText={setNumberPlate}
            autoCapitalize="characters"
          />

          <TextInput
            style={styles.input}
            placeholder="Enter Car Color"
            placeholderTextColor="#8DD3FF"
            value={carColor}
            onChangeText={setCarColor}
          />
        </View>
      </ScrollView>

      {/* Next Button - Fixed at Bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PostRideVehicleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for fixed button
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
  inputContainer: {
    gap: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#4D9EFF",
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#4D9EFF",
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
});