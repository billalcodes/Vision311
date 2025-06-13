"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from "react-native"
import { TextInput, Button, Surface } from "react-native-paper"
import { useUser } from "../context/UserContext"
import Ionicons from "react-native-vector-icons/Ionicons"
import { Alert } from "react-native"
import * as api from "../services/api"

// 311 Logo component defined locally
const Logo311 = ({ size = "medium" }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Logo colors - defined locally
  const logoColors = {
    primary: "#FF5252", // Red/orange bar
    textColor: isDarkMode ? "#FFFFFF" : "#0F1A2A" // Dark blue/black for light mode, white for dark mode
  };

  // Determine sizes based on the size prop
  const fontSize = size === "large" ? 48 : size === "small" ? 24 : 36;
  const barHeight = size === "large" ? 8 : size === "small" ? 4 : 6;

  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{
        fontWeight: "bold",
        fontSize: fontSize,
        color: logoColors.textColor,
        letterSpacing: -0.5
      }}>
        311
      </Text>
      <View style={{
        backgroundColor: logoColors.primary,
        height: barHeight,
        width: "100%",
        marginTop: 2,
        borderRadius: barHeight / 2
      }} />
    </View>
  );
};

// Define local colors based on theme
const COLORS = {
  primary: "#FF5252", // Red/orange from the bar in the logo
  secondary: "#0F1A2A", // Dark blue/black from the "311" text
  background: {
    light: "#FFFFFF",
    dark: "#121212",
  },
  surface: {
    light: "#FFFFFF",
    dark: "#1E1E1E",
  },
  text: {
    light: {
      primary: "#0F1A2A",
      secondary: "#666666",
    },
    dark: {
      primary: "#FFFFFF",
      secondary: "#AAAAAA",
    },
  },
};

const AuthScreen = ({ navigation }) => {
  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === "dark"


  const [activeTab, setActiveTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, login, register } = useUser()

  // In the handleLogin function:
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigation.replace("Main");
    } catch (error) {
      Alert.alert("Login Failed", "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // In the handleSignup function:
  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      navigation.replace("Main");
    } catch (error) {
      Alert.alert("Registration Failed", "Could not create account. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setUser({
        id: "1",
        name: "Google User",
        email: "user@gmail.com",
        avatar: "https://via.placeholder.com/40",
      })
      setIsLoading(false)
      navigation.replace("Main")
    }, 1000)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? COLORS.background.dark : COLORS.background.light,
    },
    contentContainer: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 40,
    },
    subtitle: {
      fontSize: 16,
      color: isDarkMode ? COLORS.text.dark.secondary : COLORS.text.light.secondary,
      marginTop: 16,
      textAlign: "center",
    },
    tabContainer: {
      flexDirection: "row",
      marginBottom: 20,
    },
    tab: {
      flex: 1,
      padding: 12,
      alignItems: "center",
      backgroundColor: isDarkMode ? "#333333" : "#F0F0F0",
    },
    activeTab: {
      backgroundColor: COLORS.primary,
    },
    tabText: {
      fontWeight: "500",
      color: isDarkMode ? COLORS.text.dark.primary : COLORS.text.light.primary,
    },
    activeTabText: {
      color: COLORS.background.light,
    },
    inputContainer: {
      marginBottom: 16,
    },
    input: {
      marginBottom: 12,
      backgroundColor: isDarkMode ? "#333333" : "#F5F5F5",
    },
    socialButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 4,
      backgroundColor: isDarkMode ? "#333333" : "#F0F0F0",
      marginTop: 16,
    },
    socialButtonText: {
      marginLeft: 8,
      fontWeight: "500",
      color: isDarkMode ? COLORS.text.dark.primary : COLORS.text.light.primary,
    },
  })

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Logo311 size="large" />
          <Text style={styles.subtitle}>Report and track public issues in your city</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "login" && styles.activeTab]}
            onPress={() => setActiveTab("login")}
          >
            <Text style={[styles.tabText, activeTab === "login" && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "signup" && styles.activeTab]}
            onPress={() => setActiveTab("signup")}
          >
            <Text style={[styles.tabText, activeTab === "signup" && styles.activeTabText]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <Surface
          style={{
            padding: 16,
            elevation: 4,
            borderRadius: 8,
            backgroundColor: isDarkMode ? COLORS.surface.dark : COLORS.surface.light,
          }}
        >
          {activeTab === "login" ? (
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 16,
                  color: isDarkMode ? COLORS.text.dark.primary : COLORS.text.light.primary,
                }}
              >
                Login
              </Text>
              <Text
                style={{
                  marginBottom: 16,
                  color: isDarkMode ? COLORS.text.dark.secondary : COLORS.text.light.secondary,
                }}
              >
                Enter your credentials to access your account
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  theme={{ colors: { primary: COLORS.primary } }}
                />
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry
                  theme={{ colors: { primary: COLORS.primary } }}
                />
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Login
                </Button>
              </View>
            </View>
          ) : (
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 16,
                  color: isDarkMode ? COLORS.text.dark.primary : COLORS.text.light.primary,
                }}
              >
                Sign Up
              </Text>
              <Text
                style={{
                  marginBottom: 16,
                  color: isDarkMode ? COLORS.text.dark.secondary : COLORS.text.light.secondary,
                }}
              >
                Create a new account to get started
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                  theme={{ colors: { primary: COLORS.primary } }}
                />
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  theme={{ colors: { primary: COLORS.primary } }}
                />
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry
                  theme={{ colors: { primary: COLORS.primary } }}
                />
                <Button
                  mode="contained"
                  onPress={handleSignup}
                  loading={isLoading}
                  disabled={isLoading}
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Sign Up
                </Button>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleAuth} disabled={isLoading}>
            <Ionicons name="mail" size={20} color={isDarkMode ? COLORS.text.dark.primary : COLORS.text.light.primary} />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default AuthScreen