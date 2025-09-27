import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";

const amsLogo = require("../assets/images/rgukt_w.png");
const googleLogo = require("../assets/images/google.png");

type LandingPageProps = {
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

const LandingPage: React.FC<LandingPageProps> = ({ setIsLoggedIn, setUser }) => {
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // Extract user email(If userInfo, data and user are not null)
      const userEmail = userInfo?.data?.user?.email || "";

      // ✅ Restrict domain
      if (!userEmail.endsWith("@rguktrkv.ac.in")) {
        Alert.alert(
          "Access Denied",
          "Please use your College email"
        );
        await GoogleSignin.signOut();
        setIsLoggedIn(false);
        setUser(null);
        AsyncStorage.removeItem("user");
        AsyncStorage.removeItem("isLoggedIn");
        return;
      }

      // Login successful → notify App
      setIsLoggedIn(true);
      setUser({ name: userInfo?.data?.user?.familyName || "", email: userEmail });
      await AsyncStorage.setItem("user", JSON.stringify({ name: userInfo?.data?.user?.familyName || "", email: userEmail }));
      await AsyncStorage.setItem("isLoggedIn", "true");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <LinearGradient
      colors={["#600202", "#353535"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Image source={amsLogo} style={styles.logoImage} />
      <Text style={styles.welcomeText}>Welcome to AMS</Text>
      <Text style={{ fontSize: 22, color: "#FFF", textAlign: "center", fontFamily: "QuicksandMedium", marginTop: -155 }}>
        RGUKT RK-VALLEY
      </Text>
      <TouchableOpacity style={styles.loginButton} onPress={handleGoogleLogin}>
        <Image source={googleLogo} style={styles.googleLogo} />
        <Text style={styles.loginButtonText}>LogIn with Google</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "space-around", padding: 20 },
  logoImage: { width: 150, height: 150, resizeMode: "contain", tintColor: "#FFF",marginTop:80 },
  welcomeText: { fontSize: 42, color: "#FFF", textAlign: "center", fontFamily: "QuicksandBold",marginTop:-100 },
  loginButton: { flexDirection: "row", backgroundColor: "#FFF", padding: 12, paddingLeft: 25, paddingRight: 25, borderRadius: 30, alignItems: "center", justifyContent: "center",marginBottom:40 },
  googleLogo: { width: 28, height: 28, marginRight: 15,marginTop:5 },
  loginButtonText: { fontSize: 25, color: "#600202", fontFamily: "QuicksandBold" },
});

export default LandingPage;
