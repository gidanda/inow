import { useLocalSearchParams, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ScreenShell } from "../../components/screen-shell";
import { followUser, getUserProfile, setBlockedUser } from "../../services/api";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserProfile(userId)
  });

  const followMutation = useMutation({
    mutationFn: () =>
      followUser(userId, Boolean(userQuery.data && "is_following" in userQuery.data && userQuery.data.is_following)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user", userId] });
      void queryClient.invalidateQueries({ queryKey: ["me", "follows"] });
    }
  });

  const blockMutation = useMutation({
    mutationFn: () => setBlockedUser(userId, false),
    onSuccess: () => {
      router.replace("/settings/blocks");
    }
  });

  const user = userQuery.data;

  if (!user || "error" in user) {
    return <ScreenShell title="User" body="User not found." />;
  }

  return (
    <ScreenShell title={user.display_name} body={user.bio ?? "No bio"}>
      <Pressable style={styles.followButton} onPress={() => followMutation.mutate()}>
        <Text style={styles.followText}>{user.is_following ? "フォロー解除" : "フォローする"}</Text>
      </Pressable>
      <Pressable style={styles.blockButton} onPress={() => blockMutation.mutate()}>
        <Text style={styles.blockText}>ブロックする</Text>
      </Pressable>
      <View style={styles.list}>
        {user.public_maps.map((map) => (
          <Pressable key={map.id} style={styles.card} onPress={() => router.push(`/maps/${map.id}`)}>
            <Text style={styles.cardTitle}>{map.title}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  followButton: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#7a5c3e",
    paddingVertical: 14,
    alignItems: "center"
  },
  followText: {
    color: "#fffdf8",
    fontWeight: "700"
  },
  blockButton: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#f8e6e6",
    paddingVertical: 14,
    alignItems: "center"
  },
  blockText: {
    color: "#8f3030",
    fontWeight: "700"
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
  cardTitle: {
    color: "#2c241e",
    fontSize: 16,
    fontWeight: "700"
  }
});
