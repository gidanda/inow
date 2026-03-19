import { StyleSheet, Text, View, Pressable } from "react-native";
import { router } from "expo-router";

import { ScreenShell } from "../../components/screen-shell";
import { useFriendsQuery } from "../../hooks/use-friends-query";

export default function FriendsScreen() {
  const friendsQuery = useFriendsQuery();
  const follows = friendsQuery.data ?? [];

  return (
    <ScreenShell
      title="Friends"
      body="Followed users and their public maps will be surfaced from this human-first discovery view."
    >
      <View style={styles.list}>
        {follows.map((friend) => (
          <Pressable key={friend.id} style={styles.card} onPress={() => router.push(`/users/${friend.user_id}`)}>
            <Text style={styles.name}>{friend.display_name}</Text>
            <Text style={styles.meta}>@{friend.user_id}</Text>
            <Text style={styles.mapTitle}>{friend.recent_public_map_title ?? "No public map yet"}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 4,
    color: "#7a5c3e"
  },
  mapTitle: {
    marginTop: 8,
    color: "#54463b"
  }
});
