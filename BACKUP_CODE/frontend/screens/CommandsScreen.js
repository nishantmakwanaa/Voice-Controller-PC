"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

// Command categories with their commands
const commandCategories = [
  {
    id: "system",
    name: "System Control",
    icon: "laptop",
    color: "#3498db",
    commands: [
      "Shut down the computer",
      "Restart the computer",
      "Put the computer to sleep",
      "Hibernate the computer",
      "Lock the computer",
      "Sign out of the computer",
      "Switch user",
      "Open Task Manager",
      "Open Control Panel",
      "Open Settings",
      "Check battery level",
      "Show system information",
      "Open Device Manager",
      "Open System Properties",
    ],
  },
  {
    id: "files",
    name: "File & Folder Management",
    icon: "folder",
    color: "#2ecc71",
    commands: [
      "Open File Explorer",
      "Create a new folder",
      "Delete this file",
      "Rename this file to [new name]",
      "Copy this file",
      "Paste the file here",
      "Cut this file",
      "Move this file to [folder name]",
      "Search for [file name]",
      "Show hidden files",
      "Hide this file",
      "Open the recycle bin",
      "Empty the recycle bin",
      "Zip this folder",
      "Unzip this file",
      "Open [file name]",
      "Save this file",
    ],
  },
  {
    id: "apps",
    name: "Application Management",
    icon: "application",
    color: "#9b59b6",
    commands: [
      "Open [application name]",
      "Close [application name]",
      "Minimize this window",
      "Maximize this window",
      "Switch to [application name]",
      "Open a new window",
      "Open a new tab",
      "Close this tab",
      "Open Task Manager",
      "End task [application name]",
      "Install [application name]",
      "Uninstall [application name]",
      "Update all applications",
      "Run as administrator",
    ],
  },
  {
    id: "web",
    name: "Web Browsing",
    icon: "web",
    color: "#e67e22",
    commands: [
      "Open [website name]",
      "Search for [query]",
      "Go back",
      "Go forward",
      "Refresh the page",
      "Close the browser",
      "Open a new tab",
      "Close this tab",
      "Switch to tab number [number]",
      "Bookmark this page",
      "Clear browsing history",
      "Download this file",
      "Zoom in",
      "Zoom out",
      "Scroll up",
      "Scroll down",
      "Mute this tab",
      "Unmute this tab",
    ],
  },
  {
    id: "media",
    name: "Media Control",
    icon: "play-circle",
    color: "#f39c12",
    commands: [
      "Play",
      "Pause",
      "Stop",
      "Next track",
      "Previous track",
      "Increase volume",
      "Decrease volume",
      "Mute",
      "Unmute",
      "Open [media player name]",
      "Full screen",
      "Exit full screen",
      "Skip forward [X seconds/minutes]",
      "Skip backward [X seconds/minutes]",
      "Shuffle playlist",
      "Repeat this song",
    ],
  },
  {
    id: "accessibility",
    name: "Accessibility",
    icon: "account-outline",
    color: "#1abc9c",
    commands: [
      "Turn on narrator",
      "Turn off narrator",
      "Increase text size",
      "Decrease text size",
      "Turn on high contrast mode",
      "Turn off high contrast mode",
      "Open magnifier",
      "Zoom in",
      "Zoom out",
      "Turn on color filters",
      "Turn off color filters",
      "Open on-screen keyboard",
      "Close on-screen keyboard",
    ],
  },
  {
    id: "network",
    name: "Network & Connectivity",
    icon: "wifi",
    color: "#3498db",
    commands: [
      "Turn on Wi-Fi",
      "Turn off Wi-Fi",
      "Connect to [network name]",
      "Disconnect from Wi-Fi",
      "Turn on Bluetooth",
      "Turn off Bluetooth",
      "Pair Bluetooth device",
      "Unpair Bluetooth device",
      "Check internet speed",
      "Open network settings",
      "View available networks",
      "Enable airplane mode",
      "Disable airplane mode",
    ],
  },
  {
    id: "misc",
    name: "Miscellaneous",
    icon: "dots-horizontal",
    color: "#7f8c8d",
    commands: [
      "Take a screenshot",
      "Record the screen",
      "Stop recording",
      "Open calculator",
      "Open notepad",
      "Open command prompt",
      "Open PowerShell",
      "Open registry editor",
      "Open disk management",
      "Check disk space",
      "Check CPU usage",
      "Check RAM usage",
      "Check GPU usage",
      "Open event viewer",
      "Open system restore",
    ],
  },
]

export default function CommandsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredCommands, setFilteredCommands] = useState([])

  // Filter commands based on search query and selected category
  useEffect(() => {
    let filtered

    if (selectedCategory === "all") {
      // Show all categories but filter by search query
      filtered = commandCategories
        .map((category) => ({
          ...category,
          commands: category.commands.filter((cmd) => cmd.toLowerCase().includes(searchQuery.toLowerCase())),
        }))
        .filter((category) => category.commands.length > 0)
    } else {
      // Show only selected category and filter by search query
      filtered = commandCategories
        .filter((category) => category.id === selectedCategory)
        .map((category) => ({
          ...category,
          commands: category.commands.filter((cmd) => cmd.toLowerCase().includes(searchQuery.toLowerCase())),
        }))
        .filter((category) => category.commands.length > 0)
    }

    setFilteredCommands(filtered)
  }, [searchQuery, selectedCategory])

  // Render category button
  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryButton, selectedCategory === category.id && { backgroundColor: category.color }]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Icon name={category.icon} size={20} color="white" />
      <Text style={styles.categoryButtonText}>{category.name}</Text>
    </TouchableOpacity>
  )

  // Render command item
  const renderCommandItem = ({ item }) => (
    <View style={styles.commandItem}>
      <Text style={styles.commandText}>{item}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#bdc3c7" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search commands..."
          placeholderTextColor="#7f8c8d"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon name="close" size={20} color="#bdc3c7" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === "all" && { backgroundColor: "#3498db" }]}
          onPress={() => setSelectedCategory("all")}
        >
          <Icon name="view-grid" size={20} color="white" />
          <Text style={styles.categoryButtonText}>All Commands</Text>
        </TouchableOpacity>

        {commandCategories.map(renderCategoryButton)}
      </ScrollView>

      <ScrollView style={styles.commandsContainer}>
        {filteredCommands.length > 0 ? (
          filteredCommands.map((category) => (
            <View key={category.id} style={styles.categorySection}>
              <View style={[styles.categoryHeader, { backgroundColor: category.color }]}>
                <Icon name={category.icon} size={20} color="white" />
                <Text style={styles.categoryHeaderText}>{category.name}</Text>
              </View>

              {category.commands.map((command, index) => (
                <View key={index} style={styles.commandItem}>
                  <Text style={styles.commandText}>{command}</Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Icon name="magnify-close" size={60} color="#34495e" />
            <Text style={styles.noResultsText}>No commands found</Text>
            <Text style={styles.noResultsSubtext}>Try a different search term</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {filteredCommands.reduce((total, category) => total + category.commands.length, 0)} commands available
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a2533",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c3e50",
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "white",
    padding: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34495e",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonText: {
    color: "white",
    marginLeft: 4,
  },
  commandsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  categorySection: {
    marginBottom: 16,
    backgroundColor: "#2c3e50",
    borderRadius: 8,
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  categoryHeaderText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  commandItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#34495e",
  },
  commandText: {
    color: "white",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  noResultsText: {
    color: "white",
    fontSize: 18,
    marginTop: 16,
  },
  noResultsSubtext: {
    color: "#7f8c8d",
    marginTop: 8,
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

