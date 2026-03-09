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
import { login } from '../api';

const LoginFormScreen = () => {
    const router = useRouter();

    // ---------------- STATE ----------------
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // ---------------- VALIDATION ----------------
    const allFieldsFilled = () => {
        return email.trim() !== "" && password.trim() !== "";
    };

    // ---------------- LOGIN HANDLER ----------------
    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await login(email, password);

            // Navigate based on user's role
            if (response.user.role === 'driver') {
                router.push('/driverdasboard');
            } else if (response.user.role === 'rider') {
                router.push('/riderMainScreen');
            } else {
                // Role not set yet — go to role selection
                router.push('/selectrole');
            }

        } catch (error: any) {
            Alert.alert(
                "Login Failed",
                error.response?.data?.detail || "Invalid email or password"
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
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Log in to your Caravan account</Text>

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

                {/* Password Input */}
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

                {/* Login Button */}
                <TouchableOpacity
                    style={[
                        styles.loginButton,
                        { opacity: allFieldsFilled() && !loading ? 1 : 0.5 }
                    ]}
                    disabled={!allFieldsFilled() || loading}
                    onPress={handleLogin}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.loginText}>Log In</Text>
                    )}
                </TouchableOpacity>

                {/* Go to Signup */}
                <TouchableOpacity
                    style={styles.signupLink}
                    onPress={() => router.push('/signup')}
                >
                    <Text style={styles.signupLinkText}>
                        Don't have an account?{" "}
                        <Text style={styles.signupLinkBold}>Sign Up</Text>
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

export default LoginFormScreen;

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
        marginBottom: 30,
    },
    backText: {
        fontSize: 18,
        color: "#333",
        marginLeft: 4,
    },
    title: {
        fontSize: 28,
        color: "#1E2B3C",
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6BB7FF",
        marginBottom: 40,
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
    passwordRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#8BB5FF",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 30,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    loginButton: {
        backgroundColor: "#4D9FFF",
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
    },
    loginText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    signupLink: {
        alignItems: "center",
        marginTop: 10,
    },
    signupLinkText: {
        fontSize: 15,
        color: "#444",
    },
    signupLinkBold: {
        color: "#4D9FFF",
        fontWeight: "700",
    },
});
