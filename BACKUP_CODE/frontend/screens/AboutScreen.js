import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

// Card component for UI
const Card = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
)

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="microphone-variant" size={60} color="#3498db" />
          <Text style={styles.title}>VoiceCommander</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.tagline}>Control Your PC with Just Your Voice</Text>
        </View>

        <Card title="About VoiceCommander">
          <Text style={styles.paragraph}>
            VoiceCommander is a powerful desktop application that allows you to control your entire PC using voice
            commands. With support for hundreds of commands across system control, file management, applications, web
            browsing, and more, VoiceCommander provides a hands-free experience for managing your computer.
          </Text>
        </Card>

        <Card title="Features">
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#2ecc71" style={styles.featureIcon} />
            <Text style={styles.featureText}>Comprehensive voice command system</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#2ecc71" style={styles.featureIcon} />
            <Text style={styles.featureText}>System control (shutdown, restart, sleep, etc.)</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#2ecc71" style={styles.featureIcon} />
            <Text style={styles.featureText}>File and folder management</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#2ecc71" style={styles.featureIcon} />
            <Text style={styles.featureText}>Application control and management</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#2ecc71" style={styles.featureIcon} />
            <Text style={styles.featureText}>Web browsing commands</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#2ecc71" style={styles.featureIcon} />
            <Text style={styles.featureText}>Media playback control</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#2ecc71" style={styles.featureIcon} />
            <Text style={styles.featureText}>Accessibility features</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#2ecc71" style={styles.featureIcon} />
            <Text style={styles.featureText}>Customizable settings and commands</Text>
          </View>
        </Card>

        <Card title="System Requirements">
          <View style={styles.requirementItem}>
            <Text style={styles.requirementLabel}>Operating System:</Text>
            <Text style={styles.requirementValue}>Windows 10/11 (64-bit)</Text>
          </View>

          <View style={styles.requirementItem}>
            <Text style={styles.requirementLabel}>Processor:</Text>
            <Text style={styles.requirementValue}>Intel Core i3 or equivalent (2.0 GHz or higher)</Text>
          </View>

          <View style={styles.requirementItem}>
            <Text style={styles.requirementLabel}>Memory:</Text>
            <Text style={styles.requirementValue}>4 GB RAM minimum</Text>
          </View>

          <View style={styles.requirementItem}>
            <Text style={styles.requirementLabel}>Disk Space:</Text>
            <Text style={styles.requirementValue}>200 MB available space</Text>
          </View>

          <View style={styles.requirementItem}>
            <Text style={styles.requirementLabel}>Microphone:</Text>
            <Text style={styles.requirementValue}>Working microphone (built-in or external)</Text>
          </View>

          <View style={styles.requirementItem}>
            <Text style={styles.requirementLabel}>Internet:</Text>
            <Text style={styles.requirementValue}>Internet connection for some features</Text>
          </View>
        </Card>

        <Card title="Help & Support">
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Linking.openURL("https://voicecommander.example.com/docs")}
          >
            <Icon name="book-open-variant" size={20} color="white" />
            <Text style={styles.supportButtonText}>Documentation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Linking.openURL("https://voicecommander.example.com/faq")}
          >
            <Icon name="frequently-asked-questions" size={20} color="white" />
            <Text style={styles.supportButtonText}>FAQ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Linking.openURL("https://voicecommander.example.com/support")}
          >
            <Icon name="lifebuoy" size={20} color="white" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Card>

        <Card title="Legal">
          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => Linking.openURL("https://voicecommander.example.com/privacy")}
          >
            <Text style={styles.legalButtonText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => Linking.openURL("https://voicecommander.example.com/terms")}
          >
            <Text style={styles.legalButtonText}>Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => Linking.openURL("https://voicecommander.example.com/licenses")}
          >
            <Text style={styles.legalButtonText}>Third-Party Licenses</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2023 VoiceCommander. All rights reserved.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2533',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  version: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#3498db',
    marginTop: 8,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  paragraph: {
    color: '#ecf0f1',
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    color: '#ecf0f1',
    flex: 1,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  requirementLabel: {
    color: '#bdc3c7',
    width: 100,
  },
  requirementValue: {
    color: '#ecf0f1',
    flex: 1,
  },
  supportButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12\

