import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const MobileVerificationScreen = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;

    // Accept only digits
    if (/^\d*$/.test(value)) {
      setOtp(newOtp);

      // Move to next box if number entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Move backward on delete
      if (value === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = () => {
    const finalOtp = otp.join('');
    if (finalOtp.length === 6) {
      router.push('/passwordsetup'); // Change as needed
    } else {
      alert('Please enter the full OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Mobile Number</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to your number</Text>

      {/* OTP Input Boxes */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={index === 0}
          />
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
        <Text style={styles.verifyButtonText}>Verify</Text>
      </TouchableOpacity>

      {/* Resend */}
      <TouchableOpacity>
        <Text style={styles.resendText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MobileVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 120,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },

  // OTP Boxes
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
  },
  otpInput: {
    width: 50,
    height: 55,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },

  // Verify Button
  verifyButton: {
    marginTop: 40,
    backgroundColor: '#007aff',
    width: '80%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  resendText: {
    marginTop: 20,
    color: '#007aff',
    fontSize: 15,
    fontWeight: '500',
  },
});
