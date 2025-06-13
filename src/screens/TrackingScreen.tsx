"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native"
import { Card, Chip, Button } from "react-native-paper"
import Ionicons from "react-native-vector-icons/Ionicons"
import * as api from "../services/api"
import { getFullImageUrl } from '../services/api';
import { useTheme, getColors } from "../context/ThemeContext"

// 311 Logo component defined locally
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

const TrackingScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const [activeTab, setActiveTab] = useState("all")
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [complaints, setComplaints] = useState([])

  // Fetch reports when component mounts or activeTab changes
  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh reports when the screen comes into focus
      fetchReports();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
    console.log("Current complaints count:", complaints.length);
  }, [activeTab, complaints]);

  // Fetch reports from the server
  const fetchReports = async () => {
    setIsLoading(true)
    try {
      // Get reports from API
      const data = await api.getUserReports()

      // Filter reports based on activeTab
      let filteredReports = []
      if (activeTab === "all") {
        filteredReports = data
      } else {
        // Make case-insensitive comparison
        filteredReports = data.filter(
          report => report.status && report.status.toLowerCase() === activeTab.toLowerCase()
        )
      }

      console.log(`Filtered reports for tab '${activeTab}':`, filteredReports.length);
      setComplaints(filteredReports)
    } catch (error) {
      console.error("Error fetching reports:", error)
      // If API fails, use mock data for now
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Using locally cached data instead.",
        [{ text: "OK" }]
      )

      // Use mock data as fallback
      const MOCK_COMPLAINTS = getMockComplaints()

      // Filter based on active tab
      const mockedReports = activeTab === "all"
        ? MOCK_COMPLAINTS
        : MOCK_COMPLAINTS.filter(
            complaint => complaint.status && complaint.status.toLowerCase() === activeTab.toLowerCase()
          )

      console.log(`Filtered mock reports for tab '${activeTab}':`, mockedReports.length);
      setComplaints(mockedReports)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to get mock complaints data
  const getMockComplaints = () => {
    return [
      {
        id: "mock1",
        title: "Pothole on Main Street",
        issueType: "Pothole",
        description: "Large pothole causing traffic issues",
        category: "Road Issue",
        image: "https://via.placeholder.com/150x100",
        location: "123 Main St",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        status: "Pending",
        updates: [{ date: new Date(Date.now() - 86400000 * 2).toISOString(), text: "Report submitted" }]
      },
      {
        id: "mock2",
        title: "Broken Streetlight",
        issueType: "Broken Streetlight",
        description: "Streetlight not working at night, creating safety concerns",
        category: "Streetlight",
        image: "https://via.placeholder.com/150x100",
        location: "456 Oak Ave",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        status: "In Progress",
        updates: [
          { date: new Date(Date.now() - 86400000 * 5).toISOString(), text: "Report submitted" },
          { date: new Date(Date.now() - 86400000 * 3).toISOString(), text: "Complaint reviewed by city officials" },
          { date: new Date(Date.now() - 86400000 * 1).toISOString(), text: "Maintenance team scheduled for repair" }
        ]
      },
      {
        id: "mock3",
        title: "Graffiti on Public Building",
        issueType: "Graffiti",
        description: "Unauthorized graffiti on city hall wall",
        category: "Vandalism",
        image: "https://via.placeholder.com/150x100",
        location: "City Hall",
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        status: "Resolved",
        updates: [
          { date: new Date(Date.now() - 86400000 * 10).toISOString(), text: "Report submitted" },
          { date: new Date(Date.now() - 86400000 * 7).toISOString(), text: "Complaint reviewed by city officials" },
          { date: new Date(Date.now() - 86400000 * 5).toISOString(), text: "Cleaning crew dispatched" },
          { date: new Date(Date.now() - 86400000 * 3).toISOString(), text: "Graffiti removed, issue resolved" }
        ]
      }
    ];
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Unknown date"
    }
  }

  // Function to get appropriate color for status
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

  // Function to change report status
  const changeReportStatus = async (newStatus) => {
    if (!selectedComplaint) return;

    setIsRefreshing(true);
    try {
      // Create the updated complaint object
      const now = new Date().toISOString();
      const updatedComplaint = {
        ...selectedComplaint,
        status: newStatus,
        updates: [
          ...(selectedComplaint.updates || []),
          { date: now, text: `Status changed to ${newStatus}` }
        ]
      };

      // Update the state for immediate feedback
      setSelectedComplaint(updatedComplaint);

      // If it's a MongoDB record
      if (selectedComplaint._id) {
        try {
          await api.updateReport(selectedComplaint._id, {
            status: newStatus,
            updateText: `Status changed to ${newStatus}`
          });
          console.log(`Status updated to ${newStatus} for report ${selectedComplaint._id}`);
        } catch (error) {
          console.error("Error updating report status:", error);
        }
      } else if (selectedComplaint.id && selectedComplaint.id.startsWith('mock')) {
        // For mock records, just update state
        console.log(`Status updated to ${newStatus} for mock report ${selectedComplaint.id}`);
      }

      // If status is changed to "Resolved", navigate to the sentiment analysis screen
      if (newStatus === "Resolved") {
        // Navigate to sentiment screen with the complaint data
        navigation.navigate("Sentiment", { report: updatedComplaint });
      } else {
        // Go back to the list to see updates for non-resolved statuses
        setSelectedComplaint(null);
      }

      // Refresh the reports list
      await fetchReports();
    } catch (error) {
      console.error(`Error changing status to ${newStatus}:`, error);
      Alert.alert("Error", `Failed to update status to ${newStatus}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to request an update for a complaint
  const requestUpdate = async (complaintId) => {
    if (!complaintId) {
      console.error("Error: complaintId is undefined or null");
      Alert.alert("Error", "Invalid report ID");
      return;
    }

    setIsRefreshing(true);
    try {
      if (complaintId.toString().startsWith('mock')) {
        // For mock IDs, just update locally without calling the API
        if (selectedComplaint) {
          const now = new Date().toISOString();
          const updatedComplaint = {
            ...selectedComplaint,
            updates: [
              ...(selectedComplaint.updates || []),
              { date: now, text: "User requested an update on this report" }
            ]
          };
          setSelectedComplaint(updatedComplaint);
        }

        Alert.alert("Success", "Update request sent successfully");
        return;
      }

      // Call API to request an update
      const result = await api.updateReport(complaintId, {
        updateText: "User requested an update on this report"
      });

      if (result.success) {
        Alert.alert("Success", "Update request sent successfully");

        // If we have a selected complaint, refresh it
        if (selectedComplaint && selectedComplaint._id === complaintId) {
          const updatedReport = await api.getReportById(complaintId);
          if (updatedReport) {
            setSelectedComplaint(updatedReport);
          }
        }
      } else {
        throw new Error("Failed to request update");
      }
    } catch (error) {
      console.error("Error requesting update:", error);
      Alert.alert("Error", "Could not request update at this time");

      // Mock update for demo purposes
      if (selectedComplaint) {
        const now = new Date().toISOString();
        const updatedComplaint = {
          ...selectedComplaint,
          updates: [
            ...(selectedComplaint.updates || []),
            { date: now, text: "User requested an update on this report" }
          ]
        };
        setSelectedComplaint(updatedComplaint);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to process image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150x100";

    if (imagePath.startsWith('http')) {
      return imagePath;
    } else if (imagePath.startsWith('/uploads')) {
      // This is a server path, prepend the API base URL
      return getFullImageUrl(imagePath) || "https://via.placeholder.com/150x100";
    } else if (imagePath.startsWith('file://')) {
      // This is a local file path, use as is
      return imagePath;
    } else {
      // Default to placeholder
      return "https://via.placeholder.com/150x100";
    }
  };

  // Updated render function for complaint item
  const renderComplaintItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedComplaint(item)}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.cardImage}
            onError={(e) => console.log("Image loading error:", e.nativeEvent?.error)}
            defaultSource={{ uri: "https://via.placeholder.com/150x100" }}
          />
          <View style={styles.cardDetails}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? "#FFFFFF" : "#000000" }]}>
                {item.title || item.issueType || "Unknown Issue"}
              </Text>
              <Chip
                mode="outlined"
                textStyle={{ color: getStatusColor(item.status) }}
                style={{ borderColor: getStatusColor(item.status) }}
              >
                {item.status}
              </Chip>
            </View>
            <Text style={styles.cardLocation}>{item.location || "Unknown location"}</Text>
            <Text style={styles.cardTimestamp}>
              {formatDate(item.createdAt || item.timestamp)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

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
    tabContainer: {
      flexDirection: "row",
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#333333" : "#EEEEEE",
    },
    tab: {
      flex: 1,
      padding: 12,
      alignItems: "center",
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: COLORS.primary,
    },
    tabText: {
      fontWeight: "500",
      color: isDarkMode ? "#AAAAAA" : "#666666",
    },
    activeTabText: {
      color: COLORS.primary,
      fontWeight: "bold",
    },
    content: {
      flex: 1,
    },
    listContainer: {
      padding: 8,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    emptyText: {
      fontSize: 16,
      color: isDarkMode ? "#AAAAAA" : "#666666",
      marginTop: 8,
    },
    card: {
      marginBottom: 8,
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    cardImage: {
      width: 60,
      height: 60,
      borderRadius: 4,
      backgroundColor: "#E1E1E1", // Placeholder color while loading
    },
    cardDetails: {
      flex: 1,
      marginLeft: 12,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "500",
      flex: 1,
      marginRight: 8,
    },
    cardLocation: {
      fontSize: 14,
      color: isDarkMode ? "#AAAAAA" : "#666666",
    },
    cardTimestamp: {
      fontSize: 12,
      color: isDarkMode ? "#AAAAAA" : "#888888",
      marginTop: 4,
    },
    detailContainer: {
      padding: 16,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    backButtonText: {
      marginLeft: 4,
      fontSize: 14,
      color: COLORS.primary,
    },
    detailHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    detailTitle: {
      fontSize: 20,
      fontWeight: "bold",
      flex: 1,
      marginRight: 8,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    detailImageContainer: {
      flexDirection: "row",
      marginBottom: 16,
    },
    detailImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
      marginRight: 16,
      backgroundColor: "#E1E1E1", // Placeholder color while loading
    },
    detailInfo: {
      flex: 1,
      justifyContent: "center",
    },
    detailInfoText: {
      fontSize: 14,
      marginBottom: 4,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    detailInfoLabel: {
      fontWeight: "bold",
    },
    timelineTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    timelineItem: {
      flexDirection: "row",
      marginBottom: 16,
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: COLORS.primary,
      marginTop: 4,
    },
    timelineContent: {
      flex: 1,
      marginLeft: 12,
    },
    timelineDate: {
      fontSize: 14,
      fontWeight: "500",
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    timelineText: {
      fontSize: 14,
      color: isDarkMode ? "#AAAAAA" : "#666666",
      marginTop: 4,
    },
    timelineLine: {
      position: "absolute",
      left: 5.5,
      top: 16,
      bottom: 0,
      width: 1,
      backgroundColor: isDarkMode ? "#444444" : "#DDDDDD",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 8,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    description: {
      fontSize: 14,
      color: isDarkMode ? "#DDDDDD" : "#333333",
      marginBottom: 16,
    },
    statusButton: {
      flex: 1,
      marginHorizontal: 4,
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo311 size="small" />
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Complaints</Text>
          <Text style={styles.subtitle}>Track the status of your reported issues</Text>
        </View>
      </View>

      {isLoading && !selectedComplaint ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: isDarkMode ? "#AAAAAA" : "#666666" }}>
            Loading reports...
          </Text>
        </View>
      ) : selectedComplaint ? (
        <ScrollView contentContainerStyle={styles.detailContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedComplaint(null)}>
            <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
            <Text style={styles.backButtonText}>Back to list</Text>
          </TouchableOpacity>

          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{selectedComplaint.title || selectedComplaint.issueType}</Text>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(selectedComplaint.status) }}
              style={{ borderColor: getStatusColor(selectedComplaint.status) }}
            >
              {selectedComplaint.status}
            </Chip>
          </View>

          <View style={styles.detailImageContainer}>
            <Image
              source={{ uri: getImageUrl(selectedComplaint.image) }}
              style={styles.detailImage}
              onError={(e) => console.log("Detail image loading error:", e.nativeEvent?.error)}
            />
            <View style={styles.detailInfo}>
              <Text style={styles.detailInfoText}>
                <Text style={styles.detailInfoLabel}>Location:</Text> {selectedComplaint.location}
              </Text>
              <Text style={styles.detailInfoText}>
                <Text style={styles.detailInfoLabel}>Category:</Text> {selectedComplaint.category || selectedComplaint.issueType}
              </Text>
              <Text style={styles.detailInfoText}>
                <Text style={styles.detailInfoLabel}>Reported:</Text> {formatDate(selectedComplaint.createdAt || selectedComplaint.timestamp)}
              </Text>
              {selectedComplaint.authority && (
                <Text style={styles.detailInfoText}>
                  <Text style={styles.detailInfoLabel}>Authority:</Text> {selectedComplaint.authority}
                </Text>
              )}
            </View>
          </View>

          {selectedComplaint.description && (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{selectedComplaint.description}</Text>
            </>
          )}

          {selectedComplaint.aiDescription && (
            <>
              <Text style={styles.sectionTitle}>AI Analysis</Text>
              <Text style={styles.description}>{selectedComplaint.aiDescription}</Text>
            </>
          )}

          <Text style={styles.timelineTitle}>Status Timeline</Text>

          {(selectedComplaint.updates || []).length > 0 ? (
            (selectedComplaint.updates || []).map((update, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {index < (selectedComplaint.updates || []).length - 1 && <View style={styles.timelineLine} />}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>{formatDate(update.date)}</Text>
                  <Text style={styles.timelineText}>{update.text}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: isDarkMode ? "#AAAAAA" : "#666666", fontStyle: 'italic' }}>
              No updates available yet.
            </Text>
          )}

          {/* Add status change buttons */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Change Status</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => changeReportStatus("Pending")}
                disabled={selectedComplaint.status === "Pending" || isRefreshing}
                style={[styles.statusButton, { borderColor: "#FF5252" }]}
                color="#FF5252"
                theme={{ colors: { primary: "#FF5252" } }}
              >
                Pending
              </Button>
              <Button
                mode="outlined"
                onPress={() => changeReportStatus("In Progress")}
                disabled={selectedComplaint.status === "In Progress" || isRefreshing}
                style={[styles.statusButton, { borderColor: "#FF5252" }]}
                color="#FF5252"
                theme={{ colors: { primary: "#FF5252" } }}
              >
                In Progress
              </Button>
              <Button
                mode="outlined"
                onPress={() => changeReportStatus("Resolved")}
                disabled={selectedComplaint.status === "Resolved" || isRefreshing}
                style={[styles.statusButton, { borderColor: "#FF5252" }]}
                color="#FF5252"
                theme={{ colors: { primary: "#FF5252" } }}
              >
                Resolved
              </Button>
            </View>
          </View>

          {/* Request Update button */}
          {selectedComplaint.status !== "Resolved" && (
            <Button
              mode="contained"
              icon="bell-ring"
              style={{ marginTop: 16, backgroundColor: "#FF5252" }}
              theme={{ colors: { primary: "#FF5252" } }}
              onPress={() => requestUpdate(selectedComplaint.id || selectedComplaint._id)}
              loading={isRefreshing}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Sending Request..." : "Request Update"}
            </Button>
          )}


          {/* View Full Report button */}
          <Button
            mode="outlined"
            icon="file-document"
            style={{ marginTop: 16, borderColor: "#FF5252" }}
            onPress={() => navigation.navigate("Report", { report: selectedComplaint })}
            color="#FF5252"
            theme={{ colors: { primary: "#FF5252" } }}
          >
            View Full Report
          </Button>
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "all" && styles.activeTab]}
              onPress={() => setActiveTab("all")}
            >
              <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "in progress" && styles.activeTab]}
              onPress={() => setActiveTab("in progress")}
            >
              <Text style={[styles.tabText, activeTab === "in progress" && styles.activeTabText]}>In Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "resolved" && styles.activeTab]}
              onPress={() => setActiveTab("resolved")}
            >
              <Text style={[styles.tabText, activeTab === "resolved" && styles.activeTabText]}>Resolved</Text>
            </TouchableOpacity>
          </View>

          {complaints.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={48} color={isDarkMode ? "#555555" : "#CCCCCC"} />
              <Text style={styles.emptyText}>No complaints found</Text>
              <Button
                mode="contained"
                style={{ marginTop: 16, backgroundColor: COLORS.primary }}
                icon="refresh"
                onPress={fetchReports}
              >
                Refresh
              </Button>
            </View>
          ) : (
            <FlatList
              data={complaints}
              renderItem={renderComplaintItem}
              keyExtractor={(item) => item.id || item._id || Math.random().toString()}
              contentContainerStyle={styles.listContainer}
              refreshing={isLoading}
              onRefresh={fetchReports}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default TrackingScreen;