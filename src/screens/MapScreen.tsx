"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, FlatList } from "react-native"
import { Card, Chip, Button, useTheme as usePaperTheme } from "react-native-paper"
import { useTheme } from "../context/ThemeContext"
import { Picker } from "@react-native-picker/picker"
import Ionicons from "react-native-vector-icons/Ionicons"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import Logo from "../components/Logo"

// Mock data for map issues
const MOCK_MAP_ISSUES = [
  {
    id: "1",
    title: "Pothole on Main Street",
    category: "Road Issue",
    image: "https://via.placeholder.com/150x100",
    location: "123 Main St",
    coordinates: { latitude: 40.7128, longitude: -74.006 },
    status: "Pending",
    timestamp: "2023-03-15T14:30:00Z",
  },
  {
    id: "2",
    title: "Broken Streetlight",
    category: "Streetlight",
    image: "https://via.placeholder.com/150x100",
    location: "456 Oak Ave",
    coordinates: { latitude: 40.7148, longitude: -74.008 },
    status: "In Progress",
    timestamp: "2023-03-10T09:15:00Z",
  },
  {
    id: "3",
    title: "Graffiti on Public Building",
    category: "Vandalism",
    image: "https://via.placeholder.com/150x100",
    location: "City Hall",
    coordinates: { latitude: 40.7138, longitude: -74.002 },
    status: "Resolved",
    timestamp: "2023-02-28T13:45:00Z",
  },
  {
    id: "4",
    title: "Illegal Dumping",
    category: "Waste Management",
    image: "https://via.placeholder.com/150x100",
    location: "City Park",
    coordinates: { latitude: 40.7158, longitude: -74.004 },
    status: "Pending",
    timestamp: "2023-03-01T10:20:00Z",
  },
  {
    id: "5",
    title: "Fallen Tree",
    category: "Parks & Recreation",
    image: "https://via.placeholder.com/150x100",
    location: "Riverside Drive",
    coordinates: { latitude: 40.7168, longitude: -74.01 },
    status: "In Progress",
    timestamp: "2023-03-05T16:45:00Z",
  },
]

const MapScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme()
  const paperTheme = usePaperTheme()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.0222,
    longitudeDelta: 0.0121,
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

  const getMarkerColor = (status) => {
    switch (status) {
      case "Resolved":
        return "green"
      case "In Progress":
        return "orange"
      default:
        return "red"
    }
  }

  const categories = ["all", "Road Issue", "Streetlight", "Vandalism", "Waste Management", "Parks & Recreation"]

  const filteredIssues =
    selectedCategory === "all"
      ? MOCK_MAP_ISSUES
      : MOCK_MAP_ISSUES.filter((issue) => issue.category === selectedCategory)

  const renderIssueItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedIssue(item)
        setRegion({
          ...region,
          latitude: item.coordinates.latitude,
          longitude: item.coordinates.longitude,
        })
      }}
    >
      <Card style={styles.issueCard}>
        <Card.Content style={styles.issueCardContent}>
          <View style={[styles.issueIndicator, { backgroundColor: getStatusColor(item.status) }]} />
          <View style={styles.issueDetails}>
            <Text style={[styles.issueTitle, { color: isDarkMode ? "#FFFFFF" : "#000000" }]}>{item.title}</Text>
            <Text style={styles.issueLocation}>{item.location}</Text>
          </View>
          <Chip mode="outlined" style={{ height: 24 }}>
            {item.category}
          </Chip>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  )

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
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    pickerContainer: {
      width: 150,
      height: 40,
      borderWidth: 1,
      borderColor: isDarkMode ? "#555555" : "#CCCCCC",
      borderRadius: 4,
      backgroundColor: isDarkMode ? "#333333" : "#FFFFFF",
    },
    picker: {
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    content: {
      flex: 1,
      flexDirection: "column",
    },
    mapContainer: {
      flex: 1,
    },
    map: {
      width: Dimensions.get("window").width,
      height: "100%",
    },
    mapControls: {
      position: "absolute",
      right: 16,
      bottom: 16,
      backgroundColor: "transparent",
    },
    mapButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? "rgba(30, 30, 30, 0.8)" : "rgba(255, 255, 255, 0.8)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    sidebarContainer: {
      width: "100%",
      height: 200,
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "#333333" : "#EEEEEE",
    },
    issueListHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#333333" : "#EEEEEE",
    },
    issueListTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    issueList: {
      flex: 1,
    },
    issueCard: {
      marginHorizontal: 8,
      marginVertical: 4,
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    },
    issueCardContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
    },
    issueIndicator: {
      width: 4,
      height: "100%",
      borderRadius: 2,
      marginRight: 8,
    },
    issueDetails: {
      flex: 1,
      marginRight: 8,
    },
    issueTitle: {
      fontSize: 14,
      fontWeight: "500",
    },
    issueLocation: {
      fontSize: 12,
      color: isDarkMode ? "#AAAAAA" : "#666666",
    },
    selectedIssueContainer: {
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
      color: paperTheme.colors.primary,
    },
    selectedIssueImage: {
      width: "100%",
      height: 160,
      borderRadius: 8,
      marginBottom: 16,
    },
    selectedIssueTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#FFFFFF" : "#000000",
      marginBottom: 8,
    },
    selectedIssueChips: {
      flexDirection: "row",
      marginBottom: 16,
    },
    selectedIssueInfo: {
      marginBottom: 16,
    },
    selectedIssueInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    selectedIssueInfoText: {
      marginLeft: 8,
      fontSize: 14,
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="small" showText={false} />
        <Text style={styles.title}>Issue Map</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={styles.picker}
            dropdownIconColor={isDarkMode ? "#FFFFFF" : "#000000"}
          >
            {categories.map((category) => (
              <Picker.Item key={category} label={category === "all" ? "All Categories" : category} value={category} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            customMapStyle={
              isDarkMode
                ? [
                    {
                      elementType: "geometry",
                      stylers: [
                        {
                          color: "#212121",
                        },
                      ],
                    },
                    {
                      elementType: "labels.icon",
                      stylers: [
                        {
                          visibility: "off",
                        },
                      ],
                    },
                    {
                      elementType: "labels.text.fill",
                      stylers: [
                        {
                          color: "#757575",
                        },
                      ],
                    },
                    {
                      elementType: "labels.text.stroke",
                      stylers: [
                        {
                          color: "#212121",
                        },
                      ],
                    },
                    {
                      featureType: "administrative",
                      elementType: "geometry",
                      stylers: [
                        {
                          color: "#757575",
                        },
                      ],
                    },
                    {
                      featureType: "administrative.country",
                      elementType: "labels.text.fill",
                      stylers: [
                        {
                          color: "#9e9e9e",
                        },
                      ],
                    },
                    {
                      featureType: "administrative.land_parcel",
                      stylers: [
                        {
                          visibility: "off",
                        },
                      ],
                    },
                    {
                      featureType: "administrative.locality",
                      elementType: "labels.text.fill",
                      stylers: [
                        {
                          color: "#bdbdbd",
                        },
                      ],
                    },
                    {
                      featureType: "poi",
                      elementType: "labels.text.fill",
                      stylers: [
                        {
                          color: "#757575",
                        },
                      ],
                    },
                    {
                      featureType: "poi.park",
                      elementType: "geometry",
                      stylers: [
                        {
                          color: "#181818",
                        },
                      ],
                    },
                    {
                      featureType: "poi.park",
                      elementType: "labels.text.fill",
                      stylers: [
                        {
                          color: "#616161",
                        },
                      ],
                    },
                    {
                      featureType: "poi.park",
                      elementType: "labels.text.stroke",
                      stylers: [
                        {
                          color: "#1b1b1b",
                        },
                      ],
                    },
                    {
                      featureType: "road",
                      elementType: "geometry.fill",
                      stylers: [
                        {
                          color: "#2c2c2c",
                        },
                      ],
                    },
                    {
                      featureType: "road",
                      elementType: "labels.text.fill",
                      stylers: [
                        {
                          color: "#8a8a8a",
                        },
                      ],
                    },
                    {
                      featureType: "road.arterial",
                      elementType: "geometry",
                      stylers: [
                        {
                          color: "#373737",
                        },
                      ],
                    },
                    {
                      featureType: "road.highway",
                      elementType: "geometry",
                      stylers: [
                        {
                          color: "#3c3c3c",
                        },
                      ],
                    },
                    {
                      featureType: "road.highway.controlled_access",
                      elementType: "geometry",
                      stylers: [
                        {
                          color: "#4e4e4e",
                        },
                      ],
                    },
                    {
                      featureType: "road.local",
                      elementType: "labels.text.fill",
                      stylers: [
                        {
                          color: "#616161",
                        },
                      ],
                    },
                    {
                      featureType: "transit",
                      elementType: "labels.text.fill",
                      stylers: [
                        {
                          color: "#757575",
                        },
                      ],
                    },
                    {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [
                        {
                          color: "#000000",
                        },
                      ],
                    },
                    {
                      featureType: "water",
                      elementType: "labels.text.fill",
                      stylers: [
                        {
                          color: "#3d3d3d",
                        },
                      ],
                    },
                  ]
                : []
            }
          >
            {filteredIssues.map((issue) => (
              <Marker
                key={issue.id}
                coordinate={issue.coordinates}
                title={issue.title}
                description={issue.location}
                pinColor={getMarkerColor(issue.status)}
                onPress={() => setSelectedIssue(issue)}
              />
            ))}
          </MapView>

          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapButton}>
              <Ionicons name="add" size={24} color={isDarkMode ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapButton}>
              <Ionicons name="remove" size={24} color={isDarkMode ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapButton}>
              <Ionicons name="locate" size={24} color={isDarkMode ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sidebarContainer}>
          {selectedIssue ? (
            <ScrollView contentContainerStyle={styles.selectedIssueContainer}>
              <TouchableOpacity style={styles.backButton} onPress={() => setSelectedIssue(null)}>
                <Ionicons name="arrow-back" size={16} color={paperTheme.colors.primary} />
                <Text style={styles.backButtonText}>Back to list</Text>
              </TouchableOpacity>

              <Text style={styles.selectedIssueTitle}>{selectedIssue.title}</Text>

              <View style={styles.selectedIssueChips}>
                <Chip mode="outlined" style={{ marginRight: 8 }}>
                  {selectedIssue.category}
                </Chip>
                <Chip
                  mode="outlined"
                  textStyle={{ color: getStatusColor(selectedIssue.status) }}
                  style={{ borderColor: getStatusColor(selectedIssue.status) }}
                >
                  {selectedIssue.status}
                </Chip>
              </View>

              <View style={styles.selectedIssueInfo}>
                <View style={styles.selectedIssueInfoItem}>
                  <Ionicons name="location" size={16} color={isDarkMode ? "#AAAAAA" : "#666666"} />
                  <Text style={styles.selectedIssueInfoText}>{selectedIssue.location}</Text>
                </View>
                <View style={styles.selectedIssueInfoItem}>
                  <Ionicons name="calendar" size={16} color={isDarkMode ? "#AAAAAA" : "#666666"} />
                  <Text style={styles.selectedIssueInfoText}>Reported: {formatDate(selectedIssue.timestamp)}</Text>
                </View>
              </View>

              <Button mode="contained" icon="navigation" onPress={() => {}}>
                Get Directions
              </Button>
            </ScrollView>
          ) : (
            <>
              <View style={styles.issueListHeader}>
                <Text style={styles.issueListTitle}>Nearby Issues ({filteredIssues.length})</Text>
              </View>
              <FlatList
                data={filteredIssues}
                renderItem={renderIssueItem}
                keyExtractor={(item) => item.id}
                style={styles.issueList}
              />
            </>
          )}
        </View>
      </View>
    </View>
  )
}

export default MapScreen

