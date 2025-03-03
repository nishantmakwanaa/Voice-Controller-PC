"use client"

import { useState, useCallback } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import axios from "axios"

// Card component for UI
const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>

// Home screen component
export default function HomeScreen({ navigation }) {
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState("Ready")
  const [lastCommand, setLastCommand] = useState("")
  const [recentCommands, setRecentCommands] = useState([])
  const [systemInfo, setSystemInfo] = useState({
    cpu: "0%",
    memory: "0%",
    battery: "0%",
  })

  // Fetch status and recent commands when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchStatus()
      fetchRecentCommands()
      const interval = setInterval(() => {
        fetchStatus()
        fetchRecentCommands()
      }, 2000)

      return () => clearInterval(interval)
    }, []),
  )

  // Fetch system status from backend
  const fetchStatus = async () => {
    try {
      const response = await axios.get("/status")
      setIsListening(response.data.is_listening)

      // Also fetch system info
      try {
        const sysInfoResponse = await axios.post("/execute", { command: "show system information" })
        if (sysInfoResponse.data.status === "success") {
          setSystemInfo({
            cpu: `${sysInfoResponse.data.cpu_percent}%`,
            memory: `${sysInfoResponse.data.memory_percent}%`,
            battery: "N/A",
          })

          // Try to get battery info
          const batteryResponse = await axios.post("/execute", { command: "check battery level" })
          if (batteryResponse.data.status === "success" && batteryResponse.data.battery_level) {
            setSystemInfo((prev) => ({
              ...prev,
              battery: `${batteryResponse.data.battery_level}%`,
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching system info:", error)
      }
    } catch (error) {
      console.error("Error fetching status:", error)
      Alert.alert("Error", "Could not connect to Voice Commander service")
    }
  }

  // Fetch recent commands from backend
  const fetchRecentCommands = async () => {
    try {
      const response = await axios.get("/recent")
      setRecentCommands(response.data)
      if (response.data.length > 0) {
        setLastCommand(response.data[0].command)
      }
    } catch (error) {
      console.error("Error fetching recent commands:", error)
    }
  }

  // Toggle listening state
  const toggleListening = async () => {
    try {
      if (isListening) {
        const response = await axios.post("/stop")
        setIsListening(false)
        setStatus("Ready")
      } else {
        const response = await axios.post("/start")
        setIsListening(true)
        setStatus("Listening...")
      }
    } catch (error) {
      console.error("Error toggling listening state:", error)
      Alert.alert("Error", "Could not connect to Voice Commander service")
    }
  }

  // Execute a quick command
  const executeQuickCommand = async (command) => {
    try {
      setStatus(`Executing: ${command}`)
      const response = await axios.post("/execute", { command })
      setTimeout(() => {
        setStatus(isListening ? "Listening..." : "Ready")
      }, 2000)
    } catch (error) {
      console.error("Error executing command:", error)
      Alert.alert("Error", "Could not execute command")
      setStatus(isListening ? "Listening..." : "Ready")
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <Card>
          <View style={styles.statusHeader}>
            <Text style={styles.cardTitle}>Voice Command Status</Text>
            <View style={[styles.statusIndicator, { backgroundColor: isListening ? "#2ecc71" : "#7f8c8d" }]} />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusText}>Status: {status}</Text>
            {lastCommand ? <Text style={styles.lastCommandText}>Last Command: {lastCommand}</Text> : null}

            <TouchableOpacity
              style={[styles.listenButton, { backgroundColor: isListening ? "#e74c3c" : "#3498db" }]}
              onPress={toggleListening}
            >
              <Icon name={isListening ? "microphone-off" : "microphone"} size={24} color="white" />
              <Text style={styles.listenButtonText}>{isListening ? "Stop Listening" : "Start Listening"}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* System Info Card */}
        <Card>
          <Text style={styles.cardTitle}>System Information</Text>
          <View style={styles.systemInfoContainer}>
            <View style={styles.systemInfoItem}>
              <Icon name="cpu-64-bit" size={24} color="#3498db" />
              <Text style={styles.systemInfoLabel}>CPU</Text>
              <Text style={styles.systemInfoValue}>{systemInfo.cpu}</Text>
            </View>

            <View style={styles.systemInfoItem}>
              <Icon name="memory" size={24} color="#2ecc71" />
              <Text style={styles.systemInfoLabel}>Memory</Text>
              <Text style={styles.systemInfoValue}>{systemInfo.memory}</Text>
            </View>

            <View style={styles.systemInfoItem}>
              <Icon name="battery" size={24} color="#f39c12" />
              <Text style={styles.systemInfoLabel}>Battery</Text>
              <Text style={styles.systemInfoValue}>{systemInfo.battery}</Text>
            </View>
          </View>
        </Card>

        {/* Recent Commands Card */}
        <Card>
          <Text style={styles.cardTitle}>Recent Commands</Text>
          {recentCommands.length > 0 ? (
            <View style={styles.recentCommandsList}>
              {recentCommands.map((item, index) => (
                <View key={index} style={styles.recentCommandItem}>
                  <Text style={styles.recentCommandText}>{item.command}</Text>
                  <Text style={styles.recentCommandTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noCommandsText}>No recent commands</Text>
          )}
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => executeQuickCommand("open file explorer")}
            >
              <Icon name="folder" size={24} color="#3498db" />
              <Text style={styles.quickActionText}>File Explorer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton} onPress={() => executeQuickCommand("open settings")}>
              <Icon name="cog" size={24} color="#3498db" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton} onPress={() => executeQuickCommand("take a screenshot")}>
              <Icon name="camera" size={24} color="#3498db" />
              <Text style={styles.quickActionText}>Screenshot</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton} onPress={() => executeQuickCommand("open task manager")}>
              <Icon name="chart-line" size={24} color="#3498db" />
              <Text style={styles.quickActionText}>Task Manager</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* System Control Card */}
        <Card>
          <Text style={styles.cardTitle}>System Control</Text>
          <View style={styles.systemControlGrid}>
            <TouchableOpacity
              style={[styles.systemControlButton, { backgroundColor: "#3498db" }]}
              onPress={() => executeQuickCommand("lock the computer")}
            >
              <Icon name="lock" size={24} color="white" />
              <Text style={styles.systemControlText}>Lock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.systemControlButton, { backgroundColor: "#2ecc71" }]}
              onPress={() => executeQuickCommand("put the computer to sleep")}
            >
              <Icon name="power-sleep" size={24} color="white" />
              <Text style={styles.systemControlText}>Sleep</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.systemControlButton, { backgroundColor: "#f39c12" }]}
              onPress={() => executeQuickCommand("restart the computer")}
            >
              <Icon name="restart" size={24} color="white" />
              <Text style={styles.systemControlText}>Restart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.systemControlButton, { backgroundColor: "#e74c3c" }]}
              onPress={() => executeQuickCommand("shut down the computer")}
            >
              <Icon name="power" size={24} color="white" />
              <Text style={styles.systemControlText}>Shutdown</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>VoiceCommander v1.0 - Control Your PC with Just Your Voice</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a2533",
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#2c3e50",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusContent: {
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: "white",
    marginBottom: 8,
  },
  lastCommandText: {
    fontSize: 14,
    color: "#bdc3c7",
    marginBottom: 16,
  },
  listenButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  listenButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  systemInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  systemInfoItem: {
    alignItems: "center",
    flex: 1,
  },
  systemInfoLabel: {
    color: "#bdc3c7",
    fontSize: 12,
    marginTop: 4,
  },
  systemInfoValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  recentCommandsList: {
    marginTop: 8,
  },
  recentCommandItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#34495e",
  },
  recentCommandText: {
    color: "white",
    fontSize: 14,
    flex: 1,
  },
  recentCommandTime: {
    color: "#bdc3c7",
    fontSize: 12,
  },
  noCommandsText: {
    color: "#bdc3c7",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  quickActionButton: {
    width: "48%",
    backgroundColor: "#34495e",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    color: "white",
    marginTop: 8,
  },
  systemControlGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  systemControlButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  systemControlText: {
    color: "white",
    marginTop: 4,
    fontSize: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: "#2c3e50",
    alignItems: "center",
  },
  footerText: {
    color: "#bdc3c7",
    fontSize: 12,
  },
})

