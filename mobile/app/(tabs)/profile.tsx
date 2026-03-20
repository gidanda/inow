import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ScreenShell } from "../../components/screen-shell";
import { useMyMapsQuery, useProfileQuery } from "../../hooks/use-profile-query";

export default function ProfileScreen() {
  const profileQuery = useProfileQuery();
  const mapsQuery = useMyMapsQuery();
  const profile = profileQuery.data;
  const maps = mapsQuery.data ?? [];

  return (
    <ScreenShell showHeader={false}>
      <View style={styles.topBar}>
        <View />
        <Pressable style={styles.settingsButton} onPress={() => router.push("/settings")}>
          <MaterialCommunityIcons name="cog-outline" size={22} color="#1d1514" />
        </Pressable>
      </View>
      <View style={styles.profileRow}>
        {profile?.profile_image_url ? (
          <Image source={{ uri: profile.profile_image_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name="account-outline" size={24} color="#6b5a4d" />
          </View>
        )}
        <Text style={styles.displayName}>{profile?.display_name ?? "User"}</Text>
      </View>
      <View style={styles.list}>
        {maps.map((item) => (
          <Pressable key={item.id} style={styles.card} onPress={() => router.push(`/maps/${item.id}`)}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.type} {item.visibility ? `· ${item.visibility}` : ""}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.createButton} onPress={() => router.push("/maps/new")}>
        <Text style={styles.createButtonText}>新しいマップを作る</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => router.push("/saved")}>
        <Text style={styles.secondaryButtonText}>保存したマップを見る</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => router.push("/settings")}>
        <Text style={styles.secondaryButtonText}>設定を開く</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#eadfcd",
    alignItems: "center",
    justifyContent: "center"
  },
  displayName: {
    flex: 1,
    color: "#1f1a17",
    fontSize: 24,
    fontWeight: "700"
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#eadfcd",
    alignItems: "center",
    justifyContent: "center"
  },
  list: {
    gap: 12
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#fffdf8",
    padding: 14,
    borderWidth: 1,
    borderColor: "#e7dccb"
  },
  name: {
    color: "#2c241e",
    fontSize: 16,
    fontWeight: "700"
  },
  meta: {
    marginTop: 6,
    color: "#6a5a4e"
  },
  createButton: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#7a5c3e",
    paddingVertical: 14,
    alignItems: "center"
  },
  createButtonText: {
    color: "#fffdf8",
    fontWeight: "700"
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#eadfcd",
    paddingVertical: 14,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: "#513f31",
    fontWeight: "700"
  }
});
