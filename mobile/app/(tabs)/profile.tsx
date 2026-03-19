import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenShell } from "../../components/screen-shell";
import { useMyMapsQuery, useProfileQuery } from "../../hooks/use-profile-query";

export default function ProfileScreen() {
  const profileQuery = useProfileQuery();
  const mapsQuery = useMyMapsQuery();
  const profile = profileQuery.data;
  const maps = mapsQuery.data ?? [];

  return (
    <ScreenShell
      title="Profile"
      body="Owned maps, saved maps, default maps, and settings all anchor from this screen."
    >
      <View style={styles.stats}>
        <Text style={styles.stat}>{profile?.map_count ?? 0} owned maps</Text>
        <Text style={styles.stat}>{profile?.saved_map_count ?? 0} saved maps</Text>
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
  stats: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12
  },
  stat: {
    borderRadius: 999,
    backgroundColor: "#eadfcd",
    color: "#513f31",
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: "hidden"
  },
  list: {
    marginTop: 16,
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
