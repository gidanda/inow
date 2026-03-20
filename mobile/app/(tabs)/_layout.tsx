import { Platform, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const TAB_ICON_COLOR = "#4d433a";
const TAB_ICON_ACTIVE_COLOR = "#1f1a17";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: TAB_ICON_ACTIVE_COLOR,
        tabBarInactiveTintColor: TAB_ICON_COLOR,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color={color} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <MaterialCommunityIcons name="magnify" size={24} color={color} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <MaterialCommunityIcons name="account-group-outline" size={24} color={color} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <MaterialCommunityIcons name="account-circle-outline" size={24} color={color} />
            </View>
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: Platform.OS === "ios" ? 84 : 68,
    borderTopWidth: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "rgba(244,246,250,0.84)",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(255,255,255,0.74)",
    paddingBottom: Platform.OS === "ios" ? 18 : 10,
    paddingTop: 8,
    shadowColor: "#71829d",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12
  },
  tabBarItem: {
    borderRadius: 16
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.4)"
  }
});
