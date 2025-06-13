import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, Text, useColorScheme } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SentimentScreen from './src/screens/SentimentScreen';
// Screen imports
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReportScreen from './src/screens/ReportScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Context providers
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider, useTheme, getColors } from './src/context/ThemeContext';

// 311 Logo component for headers
const Logo311 = ({ size = "small", horizontal = false }) => {
  const { isDarkMode } = useTheme();

  // Logo colors
  const logoColors = {
    primary: "#FF5252", // Red/orange bar
    textColor: isDarkMode ? "#FFFFFF" : "#0F1A2A" // Dark blue/black for light mode
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
function MainTabs() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tracking') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tracking" component={TrackingScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Main navigation component
function AppNavigator() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Report"
            component={ReportScreen}
            options={{
              headerShown: true,
              headerTitle: () => <Logo311 size="small" horizontal={true} />,
              headerBackTitle: "Back",
              headerStyle: {
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text.primary,
            }}
          />
          <Stack.Screen
              name="Sentiment"
              component={SentimentScreen}
              options={{
                headerShown: true,
                headerTitle: () => <Logo311 size="small" horizontal={true} />,
                headerBackTitle: "Back",
                headerStyle: {
                  backgroundColor: colors.surface,
                },
                headerTintColor: colors.text.primary,
              }}
            />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

// ThemeApp component that will use our custom useTheme hook
const ThemeApp = () => {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </SafeAreaProvider>
  );
};

// Main App component
export default function App() {
  return (
    <ThemeProvider>
      <ThemeApp />
    </ThemeProvider>
  );
}