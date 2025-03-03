"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Alert } from "react-native"
import { Picker } from "@react-native-picker/picker"
import Slider from "@react-native-community/slider"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import axios from "axios"

// Card component for UI
const Card = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
)

// Setting item component with label and value
const SettingItem = ({ label, children, description }) => (
  <View style={styles.settingItem}>
    <View style={styles.settingLabelContainer}>
      <Text style={styles.settingLabel}>{label}</Text>
      {description && <Text style={styles.settingDescription}>{description}</Text>}
    </View>
    <View style={styles.settingValue}>{children}</View>
  </View>
)

export default function SettingsScreen({ navigation }) {
  // Settings state
  const [settings, setSettings] = useState({
    wake_word: "hey pc",
    language: "en-US",
    voice_feedback: true,
    run_in_background: true,
    auto_start_listening: false,
    microphone_sensitivity: 75,
    selected_microphone: "default",
    command_feedback: true,
    voice_confirmation: true,
    dark_mode: true,
  })

  const [availableMicrophones, setAvailableMicrophones] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load settings on component mount
  useEffect(() => {
    fetchSettings()
    fetchMicrophones()
  }, [])

  // Fetch settings from backend
  const fetchSettings = async () => {
    try {
      const response = await axios.get("/settings")
      setSettings(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching settings:", error)
      Alert.alert("Error", "Could not load settings")
      setIsLoading(false)
    }
  }

  // Fetch available microphones
  const fetchMicrophones = async () => {
    try {
      const response = await axios.get("/microphones")
      setAvailableMicrophones(response.data)
    } catch (error) {
      console.error("Error fetching microphones:", error)
    }
  }

  // Save settings to backend
  const saveSettings = async () => {
    try {
      const response = await axios.post("/settings", settings)
      if (response.data.status === "success") {
        Alert.alert("Success", "Settings saved successfully")
      } else {
        Alert.alert("Error", "Could not save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      Alert.alert("Error", "Could not save settings")
    }
  }

  // Handle setting changes
  const handleSettingChange = (key, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }))
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* General Settings */}
        <Card title="General Settings">
          <SettingItem label="Wake Word" description="The phrase to activate voice commands">
            <TextInput
              style={styles.textInput}
              value={settings.wake_word}
              onChangeText={(text) => handleSettingChange("wake_word", text)}
              placeholder="e.g., hey pc"
              placeholderTextColor="#7f8c8d"
            />
          </SettingItem>

          <SettingItem label="Language" description="Language for speech recognition">
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.language}
                style={styles.picker}
                dropdownIconColor="white"
                onValueChange={(value) => handleSettingChange("language", value)}
              >
                <Picker.Item label="English (US)" value="en-US" />
                <Picker.Item label="English (UK)" value="en-GB" />
                <Picker.Item label="Spanish" value="es-ES" />
                <Picker.Item label="French" value="fr-FR" />
                <Picker.Item label="German" value="de-DE" />
              </Picker>
            </View>
          </SettingItem>

          <SettingItem label="Run in Background" description="Keep the app running when closed">
            <Switch
              value={settings.run_in_background}
              onValueChange={(value) => handleSettingChange("run_in_background", value)}
              trackColor={{ false: "#34495e", true: "#2ecc71" }}
              thumbColor={settings.run_in_background ? "#27ae60" : "#7f8c8d"}
            />
          </SettingItem>

          <SettingItem label="Auto-start Listening" description="Start listening automatically on startup">
            <Switch
              value={settings.auto_start_listening}
              onValueChange={(value) => handleSettingChange("auto_start_listening", value)}
              trackColor={{ false: "#34495e", true: "#2ecc71" }}
              thumbColor={settings.auto_start_listening ? "#27ae60" : "#7f8c8d"}
            />
          </SettingItem>

          <SettingItem label="Dark Mode" description="Use dark theme for the application">
            <Switch
              value={settings.dark_mode}
              onValueChange={(value) => handleSettingChange("dark_mode", value)}
              trackColor={{ false: "#34495e", true: "#2ecc71" }}
              thumbColor={settings.dark_mode ? "#27ae60" : "#7f8c8d"}
            />
          </SettingItem>
        </Card>

        {/* Microphone Settings */}
        <Card title="Microphone Settings">
          <SettingItem label="Select Microphone" description="Choose which microphone to use">
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.selected_microphone}
                style={styles.picker}
                dropdownIconColor="white"
                onValueChange={(value) => handleSettingChange("selected_microphone", value)}
              >
                <Picker.Item label="Default Microphone" value="default" />
                {availableMicrophones.map((mic, index) => (
                  <Picker.Item key={index} label={mic.name} value={mic.id.toString()} />
                ))}
              </Picker>
            </View>
          </SettingItem>

          <SettingItem
            label={`Microphone Sensitivity (${settings.microphone_sensitivity}%)`}
            description="Adjust the sensitivity of the microphone"
          >
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={settings.microphone_sensitivity}
              onValueChange={(value) => handleSettingChange("microphone_sensitivity", value)}
              minimumTrackTintColor="#3498db"
              maximumTrackTintColor="#7f8c8d"
              thumbTintColor="#3498db"
            />
          </SettingItem>

          <TouchableOpacity style={styles.testButton}>
            <Text style={styles.testButtonText}>Test Microphone</Text>
          </TouchableOpacity>
        </Card>

        {/* Feedback Settings */}
        <Card title="Feedback Settings">
          <SettingItem label="Voice Feedback" description="Speak responses after commands">
            <Switch
              value={settings.voice_feedback}
              onValueChange={(value) => handleSettingChange("voice_feedback", value)}
              trackColor={{ false: "#34495e", true: "#2ecc71" }}
              thumbColor={settings.voice_feedback ? "#27ae60" : "#7f8c8d"}
            />
          </SettingItem>

          <SettingItem label="Command Feedback" description="Show visual feedback for commands">
            <Switch
              value={settings.command_feedback}
              onValueChange={(value) => handleSettingChange("command_feedback", value)}
              trackColor={{ false: "#34495e", true: "#2ecc71" }}
              thumbColor={settings.command_feedback ? "#27ae60" : "#7f8c8d"}
            />
          </SettingItem>

          <SettingItem label="Voice Confirmation" description="Confirm before executing critical commands">
            <Switch
              value={settings.voice_confirmation}
              onValueChange={(value) => handleSettingChange("voice_confirmation", value)}
              trackColor={{ false: "#34495e", true: "#2ecc71" }}
              thumbColor={settings.voice_confirmation ? "#27ae60" : "#7f8c8d"}
            />
          </SettingItem>
        </Card>

        {/* Advanced Settings */}
        <Card title="Advanced Settings">
          <TouchableOpacity style={styles.advancedButton}>
            <Icon name="database-export" size={20} color="white" />
            <Text style={styles.advancedButtonText}>Export Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.advancedButton}>
            <Icon name="database-import" size={20} color="white" />
            <Text style={styles.advancedButtonText}>Import Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.advancedButton, styles.resetButton]}>
            <Icon name="refresh" size={20} color="white" />
            <Text style={styles.advancedButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a2533",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
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
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#34495e",
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: "white",
  },
  settingDescription: {
    fontSize: 12,
    color: "#bdc3c7",
    marginTop: 4,
  },
  settingValue: {
    minWidth: 100,
    alignItems: "flex-end",
  },
  textInput: {
    backgroundColor: "#34495e",
    color: "white",
    padding: 8,
    borderRadius: 4,
    width: 150,
    textAlign: "center",
  },
  pickerContainer: {
    backgroundColor: "#34495e",
    borderRadius: 4,
    overflow: "hidden",
    width: 150,
  },
  picker: {
    color: "white",
    width: 150,
    height: 40,
  },
  slider: {
    width: 150,
    height: 40,
  },
  testButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  testButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  advancedButton: {
    backgroundColor: "#34495e",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  advancedButtonText: {
    color: "white",
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: "#e74c3c",
  },
  footer: {
    padding: 16,
    backgroundColor: "#2c3e50",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3498db",
    width: "48%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#3498db",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
})

