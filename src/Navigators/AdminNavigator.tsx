import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";

// Admin Screens
import HomeScreen from "../admin/HomeScreen";
import StudentManagement from "../admin/StudentManagement";
import FacultyManagement from "../admin/FacultyManagement";
import CrManagement from "../admin/CrManagement";
import ScheduleManagement from "../admin/ScheduleManagement";
import Profile from "../admin/Profile";

const Tab = createBottomTabNavigator();

type AdminNavigatorProps = {
  user: { name: string; email: string };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

const AdminNavigator: React.FC<AdminNavigatorProps> = ({ user, setIsLoggedIn, setUser }) => (
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
        if (route.name === "Home") iconName = "dashboard";
        if (route.name === "Student") iconName = "group";
        if (route.name === "Faculty") iconName = "school";
        if (route.name === "CR") iconName = "person-outline";
        if (route.name === "Schedule") iconName = "schedule";
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#f5f5f5",
      tabBarInactiveTintColor: "gray",
      headerShown: true,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Student" component={StudentManagement} options={{title: 'Student Management', tabBarLabel: 'Student'}}/>
    <Tab.Screen name="Faculty" component={FacultyManagement} options={{title: 'Faculty Management', tabBarLabel: 'Faculty'}}/>
    <Tab.Screen name="CR" component={CrManagement} options={{title: 'CR Management', tabBarLabel: 'CR\'s'}}/>
    <Tab.Screen name="Schedule" component={ScheduleManagement} options={{title: 'Schedule Management', tabBarLabel: 'Schedule'}} />
  </Tab.Navigator>
);

export default AdminNavigator;