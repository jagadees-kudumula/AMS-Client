import React, { useState } from "react";
import { Alert, View, TouchableOpacity, StyleSheet, Modal, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from "@react-native-async-storage/async-storage";

type ProfileProps = {
  user: {
    name: string;
    email: string;
  } | null; // Allow user to be null
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

const Profile: React.FC<ProfileProps> = ({ user, setIsLoggedIn, setUser }) => {
  const [open, setOpen] = useState(false);

  // Don't render anything if user is not available
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      setUser(null); 
      setOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <View style={{ marginRight: 10 }}>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.profileButton}
      >
        <Icon name="person" size={28} color="#f5f5f5" />
    
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdown}>
            <View style={styles.userInfo}>
              <Icon name="person" size={20} color="#600202" />
              <Text style={styles.usernameDropdown}>
                {user?.name || 'User'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.logoutItem}
              onPress={handleLogout}
            >
              <Icon name="logout" size={20} color="red" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  dropdown: {
    marginTop: 60,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    width: 160,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  usernameDropdown: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    color: 'red',
    fontWeight: '500',
  },
});

export default Profile;