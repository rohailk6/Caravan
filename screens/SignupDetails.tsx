import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { signup } from '../api'; // ← importing our api function

const SignupDetails = () => {
  const router = useRouter();

  // ---------------- STATE ----------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emergency, setEmergency] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");        // ← NEW
  const [showPassword, setShowPassword] = useState(false); // ← NEW
  const [genderOpen, setGenderOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const [loading, setLoading] = useState(false);       // ← NEW

  // ---------------- VALIDATION ----------------
  const allFieldsFilled = () => {
    return (
      name.trim() !== "" &&
      email.trim() !== "" &&
      emergency.trim() !== "" &&
      phone.trim() !== "" &&
      password.trim() !== "" &&
      selectedGender.trim() !== ""
    );
  };

  // ---------------- SIGNUP HANDLER ----------------
  const handleSignup = async () => {
    setLoading(true);
    try {
      await signup({ name, email, phone: `+92${phone}`, emergency_contact: emergency, gender: selectedGender, password });
      router.push("/verify");
    } catch (error: any) {
      // ← ADD THIS to see the real error
      console.log("Full error:", JSON.stringify(error.response?.data));
      console.log("Error status:", error.response?.status);
      console.log("Error message:", error.message);

      Alert.alert(
        "Signup Failed",
        error.response?.data?.detail || error.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <Stack.Screen options={{ headerShown: false }} />

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
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#8BB5FF"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Emergency Contact */}
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Emergency Contact"
            placeholderTextColor="#8BB5FF"
            style={styles.input}
            keyboardType="phone-pad"
            value={emergency}
            onChangeText={setEmergency}
          />
        </View>

        {/* Phone Number Row */}
        <View style={styles.phoneRow}>
          <TouchableOpacity style={styles.flagBox}></TouchableOpacity>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>+92</Text>
          </View>
          <TextInput
            placeholder="Your mobile number"
            placeholderTextColor="#8BB5FF"
            style={styles.phoneInput}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Password Input ← NEW */}
        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#8BB5FF"
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#8BB5FF"
            />
          </TouchableOpacity>
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
            By signing up, you agree to the{" "}
            <Text style={styles.bold}>Terms of service</Text> and{" "}
            <Text style={styles.bold}>Privacy policy.</Text>
          </Text>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[
            styles.signupButton,
            { opacity: allFieldsFilled() && !loading ? 1 : 0.5 }
          ]}
          disabled={!allFieldsFilled() || loading}
          onPress={handleSignup}  // ← now calls the backend
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />  // shows spinner while waiting
          ) : (
            <Text style={styles.signupText}>Sign Up</Text>
          )}
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
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  flagBox: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#E5EEFF",
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
  // ← NEW password style
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#8BB5FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  passwordInput: {
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