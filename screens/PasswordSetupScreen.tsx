import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const PasswordSetupScreen = () => {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleVerify = () => {
    if (!password || !confirm) {
      alert("Please enter both fields");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    router.push('/selectrole'); // change as needed
  };

  return (
    <View style={styles.container}>
      <Text style={styles.backText} onPress={() => router.back()}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="chevron-back" size={22} /> Back
      </Text>

      {/* Password Field */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Enter Your Password"
          placeholderTextColor="#8BB5FF"
          secureTextEntry={!showPass}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
          <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color="#8BB5FF" />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#8BB5FF"
          secureTextEntry={!showConfirm}
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="#8BB5FF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Atleast 1 number or a special character</Text>

      <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
        <Text style={styles.verifyText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PasswordSetupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 70,
    paddingHorizontal: 20,
  },
  backText: {
    fontSize: 16,
    marginBottom: 40,
    color: "#000",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#8BB5FF",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#000",
  },
  hint: {
    marginTop: -10,
    marginBottom: 20,
    color: "#8BB5FF",
    fontSize: 14,
  },
  verifyBtn: {
    backgroundColor: "#4D9EFF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  verifyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
