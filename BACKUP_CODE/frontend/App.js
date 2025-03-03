"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, Alert } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { SafeAreaProvider } from "react-native-safe-area-context"
import axios from "axios"

// Import screens
import HomeScreen from "./screens/HomeScreen"
import SettingsScreen from "./screens/SettingsScreen"
import CommandsScreen from "./screens/CommandsScreen"
import AboutScreen from "./screens/AboutScreen"

// API configuration
const API_BASE_URL = "http://127.0.0.1:5000/api"
axios.defaults.baseURL = API_BASE_URL

// Create navigation stacks
const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Main app component
export default function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check connection to Python backend on startup
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await axios.get("/test")
        if (response.data.status === "ok") {
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Connection error:", error)
        Alert.alert(
          "Connection Error",
          "Could not connect to the Voice Commander service. Please make sure the service is running.",
          [{ text: "OK" }],
        )
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  // Home stack navigator
  const HomeStack = () => (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: "Voice Commander",
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  )

  // Settings stack navigator
  const SettingsStack = () => (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  )

  // Commands stack navigator
  const CommandsStack = () => (
    <Stack.Navigator>
      <Stack.Screen
        name="CommandsScreen"
        component={CommandsScreen}
        options={{
          title: "Voice Commands",
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  )

  // About stack navigator
  const AboutStack = () => (
    <Stack.Navigator>
      <Stack.Screen
        name="AboutScreen"
        component={AboutScreen}
        options={{
          title: "About",
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  )

  // If still checking connection, show loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Starting Voice Commander...</Text>
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName

              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline"
              } else if (route.name === "Settings") {
                iconName = focused ? "cog" : "cog-outline"
              } else if (route.name === "Commands") {
                iconName = focused ? "text-box" : "text-box-outline"
              } else if (route.name === "About") {
                iconName = focused ? "information" : "information-outline"
              }

              return <Icon name={iconName} size={size} color={color} />
            },
            tabBarActiveTintColor: "#3498db",
            tabBarInactiveTintColor: "gray",
            tabBarStyle: {
              backgroundColor: "#1a2533",
            },
            headerShown: false,
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeStack}
            options={{
              tabBarLabel: "Home",
            }}
          />
          <Tab.Screen
            name="Commands"
            component={CommandsStack}
            options={{
              tabBarLabel: "Commands",
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsStack}
            options={{
              tabBarLabel: "Settings",
            }}
          />
          <Tab.Screen
            name="About"
            component={AboutStack}
            options={{
              tabBarLabel: "About",
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a2533",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
  },
})

