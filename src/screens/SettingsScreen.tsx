"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch as RNSwitch, Alert } from "react-native"
import { Avatar, Button, Divider, TextInput } from "react-native-paper"
import { useUser } from "../context/UserContext"
import { useTheme, getColors } from "../context/ThemeContext"
import Ionicons from "react-native-vector-icons/Ionicons"
import * as api from "../services/api"

// 311 Logo component defined locally
const Logo311 = ({ size = "small", horizontal = false }) => {
  const { isDarkMode } = useTheme();

  // Logo colors - defined locally
  const logoColors = {
    primary: "#FF5252", // Red/orange bar
    textColor: isDarkMode ? "#FFFFFF" : "#FF5252" // Dark blue/black for light mode, white for dark mode
  };

  // Determine sizes based on the size prop
  const fontSize = size === "large" ? 48 : size === "small" ? 24 : 36;
  const barHeight = size === "large" ? 8 : size === "small" ? 4 : 6;

  return (
    <View style={{
      flexDirection: horizontal ? "row" : "column",
      alignItems: "center"
    }}>
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
        width: horizontal ? barHeight * 3 : "100%",
        marginTop: horizontal ? 0 : 2,
        marginLeft: horizontal ? 8 : 0,
        borderRadius: barHeight / 2
      }} />
    </View>
  );
};

const SettingsScreen = ({ navigation }) => {
  // Use updateUser from context
  const { user, updateUser, logout } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getColors(isDarkMode);

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [notifications, setNotifications] = useState(true)
  const [locationServices, setLocationServices] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      console.log("Submitting update with data:", { name, email, notifications, locationServices });

      // First, update in the API
      const result = await api.updateUser({ name, email, notifications, locationServices });

      console.log("API update result:", result);

      if (result) {
        // Then update local state using the context's updateUser function
        await updateUser({
          name,
          email,
          notifications,
          locationServices
        });

        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout()
    navigation.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    })
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#121212" : "#F5F5F5",
    },
    header: {
      padding: 16,
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#333333" : "#EEEEEE",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    headerContent: {
      marginLeft: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    subtitle: {
      fontSize: 14,
      color: isDarkMode ? "#AAAAAA" : "#666666",
      marginTop: 4,
    },
    content: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    profileContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    profileInfo: {
      marginLeft: 16,
      flex: 1,
    },
    profileName: {
      fontSize: 16,
      fontWeight: "500",
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    profileEmail: {
      fontSize: 14,
      color: isDarkMode ? "#AAAAAA" : "#666666",
      marginTop: 4,
    },
    changePhotoButton: {
      marginTop: 4,
    },
    changePhotoText: {
      fontSize: 14,
      color: colors.primary,
    },
    input: {
      marginBottom: 12,
      backgroundColor: isDarkMode ? "#333333" : "#F5F5F5",
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    settingDescription: {
      fontSize: 14,
      color: isDarkMode ? "#AAAAAA" : "#666666",
      marginTop: 4,
    },
    aboutItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    aboutItemText: {
      fontSize: 14,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    aboutItemValue: {
      fontSize: 14,
      fontWeight: "500",
      color: isDarkMode ? "#AAAAAA" : "#666666",
    },
    logoutButton: {
      marginTop: 24,
      backgroundColor: "#FF5252", // Changed to match the app theme color
    },
    debugButton: {
      marginTop: 8,
      backgroundColor: "#eee",
    },
    avatarBackground: {
      backgroundColor: "#FF5252" // This sets the avatar background to orange
    }
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo311 size="small" />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.profileContainer}>
            {user?.avatar ? (
              <Avatar.Image size={64} source={{ uri: user.avatar }} />
            ) : (
              // Changed the Avatar component to use orange background
              <Avatar.Text
                size={64}
                label={user?.name?.charAt(0) || "U"}
                style={styles.avatarBackground}
                color="white" // Set text color to white for better contrast
              />
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>

          {isEditing ? (
            <View>
              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: colors.primary } }}
              />
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                theme={{ colors: { primary: colors.primary } }}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setName(user?.name || "")
                    setEmail(user?.email || "")
                    setIsEditing(false)
                  }}
                  style={{ flex: 1, marginRight: 8, borderColor: "#FF5252" }}
                  color="#FF5252"
                  theme={{ colors: { primary: "#FF5252" } }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  style={{ flex: 1, marginLeft: 8, backgroundColor: "#FF5252" }}
                  theme={{ colors: { primary: "#FF5252" } }}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <Button
              mode="outlined"
              onPress={() => setIsEditing(true)}
              color="#FF5252"
              style={{ borderColor: "#FF5252" }}
              theme={{ colors: { primary: "#FF5252" } }}
            >
              Edit Profile
            </Button>
          )}
        </View>

        <Divider />

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Toggle between light and dark themes</Text>
            </View>
            <RNSwitch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#FF5252" }} // Changed to match app theme
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive updates on your reported issues</Text>
            </View>
            <RNSwitch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#FF5252" }} // Changed to match app theme
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingDescription}>Allow app to access your location</Text>
            </View>
            <RNSwitch
              value={locationServices}
              onValueChange={setLocationServices}
              trackColor={{ false: "#767577", true: "#FF5252" }} // Changed to match app theme
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        <Divider />

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutItemText}>Version</Text>
            <Text style={styles.aboutItemValue}>1.0.0</Text>
          </View>

          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutItemText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#AAAAAA" : "#666666"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutItemText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#AAAAAA" : "#666666"} />
          </TouchableOpacity>
        </View>

        <Button mode="contained" style={styles.logoutButton} onPress={handleLogout}>
          Log Out
        </Button>
      </ScrollView>
    </View>
  )
}

export default SettingsScreen