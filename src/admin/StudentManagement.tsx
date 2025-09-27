import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";

const StudentManagement: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleCardPress = () => {
    setShowPopup(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.card} onPress={handleCardPress}>
        <Text style={styles.cardText}>Total Students Upload</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={handleCardPress}>
        <Text style={styles.cardText}>Department Wise Upload</Text>
      </TouchableOpacity>

      {/* Popup */}
      <Modal visible={showPopup} transparent animationType="slide">
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>Popup Title</Text>
            <Text style={styles.popupText}>
              This is a dummy popup message.
            </Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setShowPopup(false)}
            >
              <Text style={styles.okButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF" },
  card: {
    backgroundColor: "#600202",
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
  },
  cardText: { color: "#FFF", fontSize: 18, textAlign: "center" },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popup: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    width: "85%",
    alignItems: "center",
  },
  popupTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  popupText: { fontSize: 16, marginVertical: 5, textAlign: "center" },
  okButton: {
    marginTop: 20,
    backgroundColor: "#600202",
    padding: 12,
    borderRadius: 10,
  },
  okButtonText: { color: "#FFF", fontSize: 16 },
});

export default StudentManagement;
