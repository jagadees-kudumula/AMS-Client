import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";

// Admin Screens
import Analytics from "../faculty/Analytics";
import HomeScreen from "../faculty/HomeScreen";
import Profile from "../admin/Profile";

const Tab = createBottomTabNavigator();

type FacultyNavigatorProps = {
  user: { name: string; email: string };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

const FacultyNavigator: React.FC<FacultyNavigatorProps> = ({ user, setIsLoggedIn, setUser }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerRight: () => (
        <Profile 
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      ),
      tabBarStyle: {
        backgroundColor: '#600202', 
      },
      headerStyle: {
        backgroundColor: '#600202', 
      },
      headerTintColor: '#f5f5f5',
      tabBarIcon: ({ color, size }) => {
        let iconName: string = "home";
        if (route.name === "Schedule") iconName = "schedule";
        if (route.name === "Analytics") iconName = "analytics";
        if (route.name === "Attendance") iconName = "check-circle";
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#f5f5f5",
      tabBarInactiveTintColor: "gray",
      headerShown: true,
    })}
  >
    <Tab.Screen name="Schedule">
      {() => (
        <HomeScreen 
          userEmail={user.email}
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      )}
    </Tab.Screen>
   

    <Tab.Screen name="Analytics" component={Analytics} options={{title: 'Dashboard', tabBarLabel: 'Analytics'}} />
  </Tab.Navigator>
);

export default FacultyNavigator;
