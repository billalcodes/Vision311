"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Alert,
  Platform,
} from "react-native"
import {
  Button,
  Card,
  Chip,
  Avatar,
  TextInput,
  ActivityIndicator,
  useTheme as usePaperTheme
} from "react-native-paper"
import { useUser } from "../context/UserContext"
import * as ImagePicker from "expo-image-picker"
import { Picker } from "@react-native-picker/picker"
import Ionicons from "react-native-vector-icons/Ionicons"
import * as api from "../services/api"
import * as FileSystem from "expo-file-system"
import { useTheme } from "../context/ThemeContext"

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
  secondary: "#FF5252", // Dark blue/black from the "311" text
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
      primary: "#FF5252",
      secondary: "#666666",
    },
    dark: {
      primary: "#FFFFFF",
      secondary: "#AAAAAA",
    },
  },
};

const HomeScreen = ({ navigation }) => {
  const { user } = useUser()
  const { isDarkMode } = useTheme()
  const paperTheme = usePaperTheme()

  const [activeTab, setActiveTab] = useState("feed")
  const [selectedImage, setSelectedImage] = useState(null)
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [urgency, setUrgency] = useState("medium")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [communityIssues, setCommunityIssues] = useState([])

  // New state for AI predictions
  const [predictions, setPredictions] = useState([])
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [uploadedImagePath, setUploadedImagePath] = useState(null)

  // Fetch community issues when component mounts
  useEffect(() => {
    if (activeTab === "feed") {
      fetchCommunityIssues();
    }
  }, [activeTab]);

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffMins > 0) {
      return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
    } else {
      return "Just now";
    }
  };

  const fetchCommunityIssues = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCommunityFeed();
      setCommunityIssues(data);
    } catch (error) {
      console.error("Error fetching community issues:", error);
      // Fallback to mock data
      setCommunityIssues([
        {
          id: "1",
          title: "Pothole on Main Street",
          description: "Large pothole causing traffic issues",
          category: "Road Issue",
          image: "https://via.placeholder.com/300x200",
          location: "123 Main St",
          timestamp: "2 hours ago",
          status: "Pending",
          upvotes: 12,
          comments: 3,
          user: {
            name: "Jane Doe",
            avatar: "https://via.placeholder.com/40",
          },
        },
        {
          id: "2",
          title: "Broken Streetlight",
          description: "Streetlight not working at night, creating safety concerns",
          category: "Streetlight",
          image: "https://via.placeholder.com/300x200",
          location: "456 Oak Ave",
          timestamp: "1 day ago",
          status: "In Progress",
          upvotes: 8,
          comments: 2,
          user: {
            name: "John Smith",
            avatar: "https://via.placeholder.com/40",
          },
        },
        {
          id: "3",
          title: "Illegal Dumping",
          description: "Trash dumped in park area",
          category: "Waste Management",
          image: "https://via.placeholder.com/300x200",
          location: "City Park",
          timestamp: "3 days ago",
          status: "Resolved",
          upvotes: 24,
          comments: 7,
          user: {
            name: "Alex Johnson",
            avatar: "https://via.placeholder.com/40",
          },
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera roll permissions to upload an image.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Reduce quality to decrease file size
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;

      // Process the image to reduce its size if needed
      const processedImageUri = await processImage(imageUri);
      setSelectedImage(processedImageUri);
      analyzeImage(processedImageUri);
    }
  }

  const handleCameraCapture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera permissions to take a photo.")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Reduce quality to decrease file size
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;

      // Process the image to reduce its size if needed
      const processedImageUri = await processImage(imageUri);
      setSelectedImage(processedImageUri);
      analyzeImage(processedImageUri);
    }
  }

  // Helper function to process and resize images
  const processImage = async (uri) => {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);

      // If file size is too large (> 5MB), resize it
      if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
        console.log("Image is too large, resizing...");

        // Use ImageManipulator to resize the image
        if (Platform.OS !== 'web') {
          try {
            const { manipulateAsync, SaveFormat } = require('expo-image-manipulator');

            const manipResult = await manipulateAsync(
              uri,
              [{ resize: { width: 1000 } }], // Resize to width of 1000px (maintains aspect ratio)
              { compress: 0.7, format: SaveFormat.JPEG }
            );

            return manipResult.uri;
          } catch (err) {
            console.error("Error in image manipulation:", err);
            return uri; // Return original if manipulation fails
          }
        }
      }

      // If image is already small enough, return the original URI
      return uri;
    } catch (error) {
      console.error("Error processing image:", error);
      return uri; // Return original URI if there's an error
    }
  };

  const analyzeImage = async (imageUri) => {
    setIsAnalyzing(true);
    setPredictions([]);
    setSelectedIssue(null);

    try {
      // First upload the image to our server
      let uploadedPath = null;
      try {
        uploadedPath = await api.uploadImage(imageUri);
        setUploadedImagePath(uploadedPath);
        console.log('Image uploaded to server path:', uploadedPath);
      } catch (uploadError) {
        console.warn('Failed to upload image to server, continuing with direct analysis:', uploadError);
        // Continue with analysis even if upload fails
      }

      // Create a new FormData object for the ML analysis
      const formData = new FormData();

      // Append the image to the FormData object
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('file', {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      if (uploadedPath) {
        // If we have a server path, include it so the ML service can reference it
        formData.append('serverPath', uploadedPath);
      }

      console.log('Analyzing image:', imageUri);

      // Send the request to the ML prediction endpoint
      const response = await fetch('http://172.20.10.2:8000/predict', {
        method: 'POST',
        body: formData,
      });

      // Check if the response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image analysis response error:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      // Parse the response as JSON
      const data = await response.json();
      console.log('Image analysis result:', data);

      // Set the predictions from the API response
      setPredictions(data.predictions || []);

      // If a server path is returned for the saved image, use it
      if (data.image_path) {
        setUploadedImagePath(data.image_path);
      } else if (uploadedPath) {
        // If ML service didn't return a path but we uploaded it successfully, use that
        setUploadedImagePath(uploadedPath);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert(
        "Analysis Error",
        "Failed to connect to the analysis service. Using placeholder data instead."
      );

      // Set fallback data
      setPredictions([
        { label: "Pothole", confidence: 0.85 },
        { label: "Broken Sidewalk", confidence: 0.65 },
        { label: "Water Damage", confidence: 0.45 }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

    const handleSubmitReport = async () => {
      if (!selectedImage) {
        Alert.alert("Error", "Please provide an image of the issue");
        return;
      }

      if (!location) {
        Alert.alert("Error", "Please provide the location of the issue");
        return;
      }

      if (!description) {
        Alert.alert("Error", "Please provide a description of the issue");
        return;
      }

      if (!selectedIssue) {
        Alert.alert("Error", "Please select an issue type");
        return;
      }

      setIsLoading(true);
      try {
        // Explicitly upload the image first if it's a local file path
        let serverImagePath = uploadedImagePath;

        if (selectedImage.startsWith('file://') && !uploadedImagePath) {
          console.log("Uploading image to main server (port 5000) before creating report...");
          try {
            // This calls the uploadImage function in api.js which uploads to port 5000
            serverImagePath = await api.uploadImage(selectedImage);
            console.log("Image uploaded successfully:", serverImagePath);
          } catch (uploadError) {
            console.error("Failed to upload image:", uploadError);
            Alert.alert(
              "Upload Error",
              "Failed to upload the image. Please try again."
            );
            setIsLoading(false);
            return;
          }
        }

        // Now create the report with the server image path
        const reportData = {
          title: `${selectedIssue} Report`,
          description,
          issueType: selectedIssue,
          location,
          image: serverImagePath || selectedImage, // Use uploaded server path
          urgency,
        };

        console.log("Submitting report with data:", reportData);

        // Create the report
        const result = await api.createReport(reportData);

        if (result.success) {
          console.log("Report submitted successfully:", result.report);

          // Reset form
          setSelectedImage(null);
          setDescription("");
          setLocation("");
          setUrgency("medium");
          setSelectedIssue(null);
          setPredictions([]);
          setUploadedImagePath(null);

          // Show success message
          Alert.alert(
            "Success",
            "Report submitted successfully!",
            [
              {
                text: "View Report",
                onPress: () => navigation.navigate("Report", { report: result.report })
              },
              {
                text: "OK",
                onPress: () => {}
              }
            ]
          );

          // Refresh the community feed if we're going back to it
          fetchCommunityIssues();
        } else {
          throw new Error(result.message || "Failed to submit report");
        }
      } catch (error) {
        console.error("Error submitting report:", error);
        Alert.alert(
          "Submission Error",
          "There was a problem submitting your report. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

  // Render the predictions as selectable buttons
  const renderPredictions = () => {
    if (!predictions || predictions.length === 0) return null;

    return (
      <View style={{ marginVertical: 16 }}>
        <Text style={styles.sectionTitle}>Select the Issue Type:</Text>

        {predictions.map((prediction, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.predictionButton,
              selectedIssue === prediction.label && styles.selectedPredictionButton
            ]}
            onPress={() => setSelectedIssue(prediction.label)}
          >
            <View style={styles.predictionContent}>
              <Text style={[
                styles.predictionLabel,
                selectedIssue === prediction.label && styles.selectedPredictionLabel
              ]}>
                {prediction.label}
              </Text>

              <Text style={styles.predictionConfidence}>
                {Math.round(prediction.confidence * 100)}% Confidence
              </Text>
            </View>

            {selectedIssue === prediction.label && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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

  const renderIssueItem = ({ item }) => {
    // Make sure we have a valid image URL
    const imageUrl = item.image && typeof item.image === 'string'
      ? (item.image.startsWith('http') ? item.image : `http://172.20.10.2:5000${item.image}`)
      : "https://via.placeholder.com/300x200";

    // Format timestamp
    const timestamp = item.timestamp || (
      item.createdAt ? formatTimeAgo(new Date(item.createdAt)) : "Unknown time"
    );

    // Ensure we have user info
    const userInfo = item.user || item.userId || {
      name: "Anonymous User",
      avatar: "https://via.placeholder.com/40"
    };

    return (
      <Card style={styles.card} onPress={() => navigation.navigate("Report", { report: item })}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          defaultSource={{ uri: "https://via.placeholder.com/300x200" }} // Fallback image if loading fails
          onError={(e) => console.log(`Image load error: ${e.nativeEvent?.error}`)}
        />
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: isDarkMode ? "#FFFFFF" : "#000000" }]}>
              {item.title}
            </Text>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(item.status) }}
              style={{ borderColor: getStatusColor(item.status) }}
            >
              {item.status}
            </Chip>
          </View>
          <Text style={styles.cardLocation}>
            {item.location} • {timestamp}
          </Text>
          <Text style={[styles.cardDescription, { color: isDarkMode ? "#DDDDDD" : "#333333" }]}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.cardActions}>

            </View>

            <View style={styles.userInfo}>
              <Avatar.Image
                size={24}
                source={{ uri: userInfo.avatar }}
                onError={() => console.log("Avatar load error")}
              />
              <Text style={styles.userName}>{userInfo.name}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#121212" : "#F5F5F5",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#333333" : "#EEEEEE",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#333333" : "#EEEEEE",
    },
    tab: {
      flex: 1,
      padding: 16,
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
    feedContainer: {
      padding: 8,
    },
    card: {
      marginBottom: 16,
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    },
    cardImage: {
      height: 160,
      width: "100%",
      backgroundColor: "#E0E0E0", // Placeholder color while loading
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      flex: 1,
      marginRight: 8,
    },
    cardLocation: {
      fontSize: 12,
      color: "#888888",
      marginTop: 4,
    },
    cardDescription: {
      marginTop: 8,
      fontSize: 14,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
    },
    cardActions: {
      flexDirection: "row",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    actionText: {
      marginLeft: 4,
      fontSize: 12,
      color: isDarkMode ? "#AAAAAA" : "#666666",
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    userName: {
      marginLeft: 8,
      fontSize: 12,
      color: isDarkMode ? "#AAAAAA" : "#666666",
    },
    reportContainer: {
      padding: 16,
    },
    reportCard: {
      padding: 16,
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    },
    reportTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    reportSubtitle: {
      fontSize: 14,
      color: isDarkMode ? "#AAAAAA" : "#666666",
      marginBottom: 16,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    button: {
      flex: 1,
      marginHorizontal: 4,
    },
    imagePreview: {
      height: 200,
      width: "100%",
      borderRadius: 8,
      marginBottom: 16,
      backgroundColor: "#E0E0E0", // Placeholder color while loading
    },
    imagePreviewContainer: {
      position: "relative",
    },
    removeButton: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      borderRadius: 20,
      padding: 4,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    detectedIssueContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    detectedIssueLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 8,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    input: {
      marginBottom: 16,
      backgroundColor: isDarkMode ? "#333333" : "#F5F5F5",
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: isDarkMode ? "#555555" : "#CCCCCC",
      borderRadius: 4,
      marginBottom: 16,
    },
    picker: {
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    // New styles for predictions
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 10,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    predictionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? "#555555" : "#DDDDDD",
      backgroundColor: isDarkMode ? "#333333" : "#F5F5F5",
    },
    selectedPredictionButton: {
      borderColor: COLORS.primary,
      backgroundColor: isDarkMode ? "rgba(255, 82, 82, 0.2)" : "rgba(255, 82, 82, 0.1)",
    },
    predictionContent: {
      flex: 1,
    },
    predictionLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    selectedPredictionLabel: {
      color: COLORS.primary,
    },
    predictionConfidence: {
      fontSize: 12,
      color: isDarkMode ? "#AAAAAA" : "#666666",
      marginTop: 4,
    },
    confidenceContainer: {
      marginVertical: 10,
      padding: 10,
      backgroundColor: isDarkMode ? "#333333" : "#F5F5F5",
      borderRadius: 4,
    },
    confidenceText: {
      fontSize: 14,
      color: isDarkMode ? "#AAAAAA" : "#666666",
      marginBottom: 5,
    },
    confidenceValue: {
      fontSize: 16,
      color: isDarkMode ? "#FFFFFF" : "#000000",
      fontWeight: "bold",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo311 size="small" />
        <Avatar.Image size={32} source={{ uri: user?.avatar || "https://via.placeholder.com/40" }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "feed" && styles.activeTab]}
          onPress={() => setActiveTab("feed")}
        >
          <Text style={[styles.tabText, activeTab === "feed" && styles.activeTabText]}>Community Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "report" && styles.activeTab]}
          onPress={() => setActiveTab("report")}
        >
          <Text style={[styles.tabText, activeTab === "report" && styles.activeTabText]}>Report Issue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === "feed" ? (
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 10, color: isDarkMode ? "#AAAAAA" : "#666666" }}>
                Loading community feed...
              </Text>
            </View>
          ) : (
            <FlatList
              data={communityIssues}
              renderItem={renderIssueItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.feedContainer}
              refreshing={isLoading}
              onRefresh={fetchCommunityIssues}
              ListEmptyComponent={
                <View style={styles.loadingContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color={isDarkMode ? "#555555" : "#CCCCCC"} />
                  <Text style={{ marginTop: 10, color: isDarkMode ? "#AAAAAA" : "#666666" }}>
                    No issues found in your community
                  </Text>
                </View>
              }
            />
          )
        ) : (
          <ScrollView contentContainerStyle={styles.reportContainer}>
            <Card style={styles.reportCard}>
              <Text style={styles.reportTitle}>Report a Public Issue</Text>
              <Text style={styles.reportSubtitle}>Take a photo or upload an image of the issue</Text>

              {!selectedImage ? (
                <View>
                  <View style={styles.buttonContainer}>
                    <Button
                      mode="contained"
                      icon="camera"
                      onPress={handleCameraCapture}
                      style={styles.button}
                      disabled={isLoading}
                      color={COLORS.primary}
                    >
                      Take Photo
                    </Button>
                    <Button
                      mode="outlined"
                      icon="image"
                      onPress={handleImagePicker}
                      style={styles.button}
                      disabled={isLoading}
                    >
                      Upload from Gallery
                    </Button>
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.imagePreview}
                      onError={(e) => console.log(`Preview image error: ${e.nativeEvent?.error}`)}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        setSelectedImage(null)
                        setSelectedIssue(null)
                        setPredictions([])
                        setUploadedImagePath(null)
                      }}
                      disabled={isAnalyzing || isLoading}
                    >
                      <Ionicons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  {isAnalyzing ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                      <Text style={{ marginTop: 8, color: isDarkMode ? "#AAAAAA" : "#666666" }}>
                        Analyzing image...
                      </Text>
                    </View>
                  ) : (
                    <View>
                      {/* Render AI predictions as selectable buttons */}
                      {renderPredictions()}

                      {/* Only show these fields when a prediction is selected */}
                      {selectedIssue && (
                        <>
                          <Text style={styles.inputLabel}>Description</Text>
                          <TextInput
                            mode="outlined"
                            placeholder="Provide additional details about the issue..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                            theme={{ colors: { primary: COLORS.primary } }}
                          />

                          <Text style={styles.inputLabel}>Location</Text>
                          <TextInput
                            mode="outlined"
                            placeholder="Enter the location of the issue"
                            value={location}
                            onChangeText={setLocation}
                            style={styles.input}
                            theme={{ colors: { primary: COLORS.primary } }}
                          />

                          <Text style={styles.inputLabel}>Urgency Level</Text>
                          <View style={styles.pickerContainer}>
                            <Picker
                              selectedValue={urgency}
                              onValueChange={(itemValue) => setUrgency(itemValue)}
                              style={styles.picker}
                            >
                              <Picker.Item label="Low" value="low" />
                              <Picker.Item label="Medium" value="medium" />
                              <Picker.Item label="High" value="high" />
                            </Picker>
                          </View>

                          <Button
                            mode="contained"
                            onPress={handleSubmitReport}
                            disabled={isLoading || !location || !description || !selectedIssue}
                            loading={isLoading}
                            color={COLORS.primary}
                          >
                            {isLoading ? "Submitting..." : "Submit Report"}
                          </Button>
                        </>
                      )}
                    </View>
                  )}
                  </View>
                )}
              </Card>
            </ScrollView>
          )}
        </View>
      </View>
    );
  };

  export default HomeScreen;