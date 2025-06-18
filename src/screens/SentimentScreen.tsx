"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from "react-native"
import { Button, Card, TextInput } from "react-native-paper"
import { useTheme } from "../context/ThemeContext"

// 311 Logo component defined locally (copied from other screens)
const Logo311 = ({ size = "small", horizontal = false }) => {
  const { isDarkMode } = useTheme();

  // Logo colors - defined locally
  const logoColors = {
    primary: "#FF5252", // Red/orange bar
    textColor: isDarkMode ? "#FFFFFF" : "#0F1A2A" // Dark blue/black for light mode, white for dark mode
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

// Define local colors based on theme
const COLORS = {
  primary: "#FF5252",
  secondary: "#0F1A2A",
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

const SentimentScreen = ({ route, navigation }) => {
  const { report } = route.params || {};
  const { isDarkMode } = useTheme();

  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Function to submit feedback
  const submitFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert("Error", "Please enter your feedback");
      return;
    }

    setIsLoading(true);

    // Simulate a brief submission delay
    setTimeout(() => {
      setIsLoading(false);
      setFeedbackSubmitted(true);
      Alert.alert("Success", "Thank you for your feedback!");
    }, 1000);
  };

  const returnToPreviousScreen = () => {
    navigation.goBack();
  };

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
    card: {
      marginBottom: 16,
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    description: {
      fontSize: 14,
      color: isDarkMode ? "#DDDDDD" : "#333333",
      marginBottom: 16,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 8,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    input: {
      backgroundColor: isDarkMode ? "#333333" : "#F5F5F5",
    },
    resultContainer: {
      marginTop: 20,
      padding: 16,
      backgroundColor: isDarkMode ? "#333333" : "#F0F0F0",
      borderRadius: 8,
    },
    resultText: {
      fontSize: 16,
      lineHeight: 24,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    buttonContainer: {
      marginTop: 16,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    loadingContainer: {
      padding: 20,
      alignItems: "center",
    },
    loadingText: {
      marginTop: 10,
      color: isDarkMode ? "#AAAAAA" : "#666666",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo311 size="small" />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Feedback</Text>
          <Text style={styles.subtitle}>
            Tell us about your experience
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>
              Your Issue Has Been Resolved
            </Text>
            <Text style={styles.description}>
              {report ?
                `Your report "${report.title || report.issueType}" has been marked as resolved. We'd love to hear about your experience with the resolution process.`
                : "Your issue has been marked as resolved. We'd love to hear about your experience with the resolution process."}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Share Your Experience</Text>
              <TextInput
                mode="outlined"
                placeholder="How was your experience with our service?"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={5}
                style={styles.input}
                theme={{ colors: { primary: COLORS.primary } }}
                disabled={feedbackSubmitted}
              />
            </View>

            <Button
              mode="contained"
              onPress={submitFeedback}
              disabled={isLoading || !feedback.trim() || feedbackSubmitted}
              loading={isLoading}
              color={COLORS.primary}
            >
              {feedbackSubmitted ? "Feedback Submitted" : isLoading ? "Submitting..." : "Submit Feedback"}
            </Button>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>
                  Submitting your feedback...
                </Text>
              </View>
            )}

            {feedbackSubmitted && !isLoading && (
              <View style={styles.resultContainer}>
                <Text style={styles.sectionTitle}>Feedback Received</Text>
                <Text style={styles.resultText}>
                  Thank you for your feedback! We have received it and will use it to improve our services.
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={returnToPreviousScreen}
                color={COLORS.primary}
              >
                Back to Reports
              </Button>

              {feedbackSubmitted && (
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate("Home")}
                  color={COLORS.primary}
                >
                  Return Home
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

export default SentimentScreen;