import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const SignupDetails = () => {
  const router = useRouter();

  const [genderOpen, setGenderOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

      <Stack.Screen options={{headerShown: false}}/>

        {/* Back Button */}
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        

        {/* Title */}
        <Text style={styles.title}>Sign up with your email or phone number</Text>

        {/* Name Input */}
        <View style={styles.inputWrapper}>
          <TextInput 
            placeholder="Name"
            placeholderTextColor="#8BB5FF"
            style={styles.input}
          />
        </View>

        {/* Emergency Contact */}
        <View style={styles.inputWrapper}>
          <TextInput 
            placeholder="Emergency Contact"
            placeholderTextColor="#8BB5FF"
            style={styles.input}
          />
        </View>

        {/* Phone Number Row */}
        <View style={styles.phoneRow}>

          {/* Flag Placeholder Box */}
          <TouchableOpacity style={styles.flagBox}>
            {/* Leave empty — you will add flag image later */}
          </TouchableOpacity>

          {/* Country Code */}
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>+92</Text>
          </View>

          {/* Phone Input */}
          <TextInput 
            placeholder="Your mobile number"
            placeholderTextColor="#8BB5FF"
            style={styles.phoneInput}
            keyboardType="phone-pad"
          />

        </View>

        {/* Gender Dropdown */}
        <TouchableOpacity
          style={styles.genderWrapper}
          onPress={() => setGenderOpen(!genderOpen)}
        >
          <Text style={styles.genderText}>
            {selectedGender || "Gender"}
          </Text>
          <Ionicons
            name={genderOpen ? "chevron-up" : "chevron-down"}
            size={22}
            color="#8BB5FF"
          />
        </TouchableOpacity>

        {genderOpen && (
          <View style={styles.dropdown}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedGender(g);
                  setGenderOpen(false);
                }}
              >
                <Text style={styles.dropdownText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Terms */}
        <View style={styles.termsRow}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#4D9FFF" />
          <Text style={styles.termsText}>
            By signing up, you agree to the <Text style={styles.bold}>Terms of service</Text> and <Text style={styles.bold}>Privacy policy.</Text>
          </Text>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signupButton}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupDetails;

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontSize: 18,
    color: "#333",
    marginLeft: 4,
  },
  title: {
    fontSize: 26,
    color: "#333",
    fontWeight: "700",
    marginBottom: 30,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: "#8BB5FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    color: "#333",
  },
  phoneRow: {
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1.5,
  borderColor: "#8BB5FF",
  borderRadius: 12,
  paddingHorizontal: 14,   // UPDATED
  paddingVertical: 14,     // UPDATED (same padding as inputWrapper)
  marginBottom: 20,
  },

  flagBox: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#E5EEFF", // placeholder background
    marginRight: 8,
  },
  codeBox: {
    borderRightWidth: 1,
    borderColor: "#8BB5FF",
    paddingRight: 10,
    marginRight: 10,
  },
  codeText: {
    fontSize: 16,
    color: "#333",
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  genderWrapper: {
    borderWidth: 1.5,
    borderColor: "#8BB5FF",
    borderRadius: 12,
    padding: 14,
    paddingRight: 50,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  genderText: {
    fontSize: 16,
    color: "#8BB5FF",
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: "#8BB5FF",
    borderRadius: 12,
    backgroundColor: "#F8F9FF",
    marginBottom: 20,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#D0E2FF",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#444",
  },
  bold: {
    fontWeight: "700",
    color: "#2C74FF",
  },
  signupButton: {
    backgroundColor: "#4D9FFF",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  signupText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
