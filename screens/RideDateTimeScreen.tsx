import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const RideDateTimeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // State for the selected date and time
  const [date, setDate] = useState(new Date());

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const handleNext = () => {
    router.push({
      pathname: "/selectrole", 
      params: {
        ...params,
        selectedDate: date.toISOString(),
      },
    });
  };

  // Formatter for the blue display text below the spinner
  const formatDisplayDate = () => {
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dayName = date.toLocaleDateString([], { weekday: 'long' });
    const monthDay = date.toLocaleDateString([], { month: 'long', day: 'numeric' });
    
    return { time, monthDay, dayName };
  };

  const { time, monthDay, dayName } = formatDisplayDate();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Post Ride</Text>
        <Text style={styles.sectionTitle}>Ride Details</Text>

        {/* Date Picker Card */}
        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>Select Date & Time</Text>
          
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={date}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChange}
              textColor="#000"
              style={styles.datePicker}
            />
          </View>

          {/* Formatted Output Text */}
          <View style={styles.displayContainer}>
            <Text style={styles.displayText}>{time}</Text>
            <Text style={styles.displayText}>{monthDay}</Text>
            <Text style={styles.displayText}>{dayName}</Text>
          </View>
        </View>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RideDateTimeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
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
  content: {
    paddingHorizontal: 25,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "500",
    color: "#4D9EFF",
    marginBottom: 20,
  },
  pickerCard: {
    borderWidth: 1.5,
    borderColor: "#4D9EFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  pickerTitle: {
    fontSize: 20,
    color: "#4D9EFF",
    fontWeight: "500",
    marginBottom: 10,
  },
  pickerWrapper: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
  },
  datePicker: {
    width: '100%',
    height: '100%',
  },
  displayContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  displayText: {
    fontSize: 22,
    color: "#4D9EFF",
    fontWeight: "500",
    lineHeight: 30,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
  },
  nextButton: {
    backgroundColor: "#4D9EFF",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
});