"use client"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Image, Share, Alert, ActivityIndicator, Clipboard, useColorScheme } from "react-native"
import { Button, Card, Chip } from "react-native-paper"
import Ionicons from "react-native-vector-icons/Ionicons"
import * as api from "../services/api"
import { getFullImageUrl } from '../services/api';

// 311 Logo component defined locally
const Logo311 = ({ size = "small", horizontal = false }) => {
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

const ReportScreen = ({ route, navigation }) => {
  const { report } = route.params
  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === "dark"

  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [reportData, setReportData] = useState(report)
    const getImageUrl = (imagePath) => {
      return getFullImageUrl(imagePath) || "https://via.placeholder.com/300x200";
    };
  useEffect(() => {
    // Update local state when the route parameters change
    if (route.params?.report) {
      setReportData(route.params.report)
    }
  }, [route.params?.report])

  // If needed, refresh the report data from the server
  const refreshReport = async () => {
    if (!reportData || !reportData.id) return

    setIsRefreshing(true)
    try {
      const updatedReport = await api.getReportById(reportData.id)
      if (updatedReport) {
        setReportData(updatedReport)
      }
    } catch (error) {
      console.error("Error refreshing report:", error)
      Alert.alert("Error", "Failed to refresh report data")
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!reportData) {
    return (
      <View style={[themedStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>No report data available.</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16, backgroundColor: COLORS.primary }}
        >
          Go Back
        </Button>
      </View>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "#10b981" // green
      case "In Progress":
        return "#f59e0b" // amber
      default:
        return "#ef4444" // red
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "#ef4444" // red
      case "medium":
        return "#f59e0b" // amber
      case "low":
        return "#10b981" // green
      default:
        return "#6b7280" // gray
    }
  }

  // Process the image URL

  // Auto-generated complaint text based on the report data
  const complaintText = `
I would like to report a ${reportData.issueType ? reportData.issueType.toLowerCase() : "issue"} at ${reportData.location}.

The issue is ${reportData.urgency === "high" ? "severely" : reportData.urgency === "medium" ? "moderately" : "slightly"} affecting the area and requires attention.

Details: ${reportData.description}

${reportData.aiDescription ? `AI Analysis: ${reportData.aiDescription}` : ""}

This issue was reported on ${formatDate(reportData.createdAt || reportData.timestamp)}.
  `.trim();

  const handleShareReport = async () => {
    try {
      await Share.share({
        message: complaintText,
        title: reportData.title || `${reportData.issueType} Report`,
      });
    } catch (error) {
      console.log("Share error:", error.message);
      Alert.alert("Error", "Could not share the report");
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      Clipboard.setString(complaintText);
      Alert.alert("Success", "Complaint text copied to clipboard!");
    } catch (error) {
      console.log("Clipboard error:", error.message);
      Alert.alert("Error", "Could not copy text to clipboard");
    }
  }

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#121212" : "#F5F5F5",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      flex: 1,
      marginRight: 8,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    locationText: {
      fontSize: 14,
      color: isDarkMode ? "#AAAAAA" : "#666666",
      marginLeft: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "500",
      marginTop: 16,
      marginBottom: 8,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    description: {
      fontSize: 14,
      color: isDarkMode ? "#DDDDDD" : "#333333",
    },
    userName: {
      marginLeft: 8,
      fontSize: 14,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    timestamp: {
      fontSize: 14,
      color: isDarkMode ? "#AAAAAA" : "#666666",
      marginTop: 8,
    },
    complaintCard: {
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    },
    complaintTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    complaintText: {
      backgroundColor: isDarkMode ? "#333333" : "#F5F5F5",
      padding: 16,
      borderRadius: 8,
      fontSize: 14,
      lineHeight: 20,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    card: {
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    },
    confidenceContainer: {
      marginTop: 10,
      padding: 10,
      backgroundColor: isDarkMode ? "#333333" : "#F5F5F5",
      borderRadius: 8,
    },
    confidenceText: {
      fontSize: 14,
      color: isDarkMode ? "#AAAAAA" : "#666666",
    },
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    },
    content: {
      padding: 16,
    },
    card: {
      marginBottom: 16,
    },
    image: {
      height: 200,
      width: "100%",
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      backgroundColor: "#E0E0E0", // Placeholder color while loading
    },
    cardContent: {
      padding: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    location: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 16,
      gap: 8,
    },
    userContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 16,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
    refreshButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 10,
    },
  });

  return (
    <View style={[styles.container, themedStyles.container]}>
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: 'white', marginTop: 10 }}>Loading...</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={[styles.card, themedStyles.card]}>
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: getImageUrl(reportData.image) }}
              style={styles.image}
              onError={(e) => console.log(`Image loading error: ${e.nativeEvent?.error}`)}
            />

            {/* Refresh button */}
            <Button
              mode="contained"
              icon="refresh"
              style={styles.refreshButton}
              compact
              onPress={refreshReport}
              loading={isRefreshing}
              disabled={isRefreshing || isLoading}
              color={COLORS.primary}
            >
              {isRefreshing ? "" : "Refresh"}
            </Button>
          </View>

          <Card.Content style={styles.cardContent}>
            <View style={styles.header}>
              <Text style={themedStyles.title}>
                {reportData.title || `${reportData.issueType} Report`}
              </Text>
              <Chip
                mode="outlined"
                textStyle={{ color: getStatusColor(reportData.status) }}
                style={{ borderColor: getStatusColor(reportData.status) }}
              >
                {reportData.status}
              </Chip>
            </View>

            <View style={styles.location}>
              <Ionicons name="location" size={16} color={isDarkMode ? "#AAAAAA" : "#666666"} />
              <Text style={themedStyles.locationText}>{reportData.location}</Text>
            </View>

            <View style={styles.chipContainer}>
              <Chip mode="outlined">{reportData.category || reportData.issueType}</Chip>
              {reportData.urgency && (
                <Chip
                  mode="outlined"
                  textStyle={{ color: getUrgencyColor(reportData.urgency) }}
                  style={{ borderColor: getUrgencyColor(reportData.urgency) }}
                >
                  {reportData.urgency.charAt(0).toUpperCase() + reportData.urgency.slice(1)} Urgency
                </Chip>
              )}
              {reportData.confidenceScore && (
                <Chip mode="outlined">
                  {Math.round(reportData.confidenceScore * 100)}% Confidence
                </Chip>
              )}
            </View>

            <Text style={themedStyles.sectionTitle}>Description</Text>
            <Text style={themedStyles.description}>{reportData.description}</Text>

            {reportData.aiDescription && (
              <>
                <Text style={themedStyles.sectionTitle}>AI Analysis</Text>
                <Text style={themedStyles.description}>{reportData.aiDescription}</Text>

                {reportData.authority && (
                  <View style={themedStyles.confidenceContainer}>
                    <Text style={themedStyles.confidenceText}>
                      Responsible Authority: {reportData.authority}
                    </Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.userContainer}>
              <Image
                source={{
                  uri: reportData.user?.avatar ||
                       reportData.userId?.avatar ||
                       "https://via.placeholder.com/40"
                }}
                style={{ width: 24, height: 24, borderRadius: 12 }}
                onError={(e) => console.log("Avatar loading error:", e.nativeEvent?.error)}
              />
              <Text style={themedStyles.userName}>
                Submitted by {reportData.user?.name || reportData.userId?.name || "Anonymous"}
              </Text>
            </View>

            <Text style={themedStyles.timestamp}>
              Submission Time: {formatDate(reportData.createdAt || reportData.timestamp)}
            </Text>

            {/* Timeline if available */}
            {reportData.updates && reportData.updates.length > 0 && (
              <>
                <Text style={themedStyles.sectionTitle}>Updates</Text>
                {reportData.updates.map((update, index) => (
                  <View key={index} style={{ marginBottom: 10, borderLeftWidth: 2, borderLeftColor: COLORS.primary, paddingLeft: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: isDarkMode ? "#FFFFFF" : "#000000" }}>
                      {formatDate(update.date)}
                    </Text>
                    <Text style={{ color: isDarkMode ? "#DDDDDD" : "#333333" }}>
                      {update.text}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={themedStyles.complaintCard}>
          <Card.Content>
            <Text style={themedStyles.complaintTitle}>Generated Complaint</Text>
            <Text style={themedStyles.complaintText}>{complaintText}</Text>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                icon="content-copy"
                onPress={handleCopyToClipboard}
                disabled={isLoading}
                color={COLORS.primary}
              >
                Copy Text
              </Button>
              <Button
                mode="contained"
                icon="share"
                onPress={handleShareReport}
                disabled={isLoading}
                color={COLORS.primary}
              >
                Share Report
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

export default ReportScreen;