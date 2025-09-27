import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LandingPage from "./LandingPage";
import AdminNavigator from "./Navigators/AdminNavigator";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Type
type UserInfo = { name: string; email: string };

// Configure Google
GoogleSignin.configure({
  webClientId: '188805815138-jua9enfk6oslbtol9cm49lrb4c83c8h8.apps.googleusercontent.com',
  offlineAccess: true,
});

const App: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedLoggedIn = await AsyncStorage.getItem("isLoggedIn");
        if (storedUser && storedLoggedIn === "true") {
          setUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return null;

  const renderPortal = () => {
    if (!user) return <LandingPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} />;

    const email = user.email;

    if (email === "r210387@rguktrkv.ac.in") {
      return (
        <AdminNavigator 
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      );
    }

    return <LandingPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} />;
  };

  return (
    <NavigationContainer>
      {isLoggedIn ? renderPortal() : <LandingPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}
    </NavigationContainer>
  );
};

export default App;