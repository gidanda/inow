import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../components/screen-shell";
import { useAuth } from "../../lib/auth";

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <ScreenShell title="Settings" body="Profile actions, block management, and logout live here.">
      <View style={styles.list}>
        <Pressable style={styles.card} onPress={() => router.push("/settings/blocks")}>
          <Text style={styles.cardTitle}>ブロック管理</Text>
          <Text style={styles.cardMeta}>Blocked users can be reviewed here.</Text>
        </Pressable>
        <Pressable
          style={[styles.card, styles.logoutCard]}
          onPress={() => {
            void signOut();
            router.replace("/auth/login");
          }}
        >
          <Text style={styles.logoutTitle}>ログアウト</Text>
        </Pressable>
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
  logoutCard: {
    backgroundColor: "#f8e6e6",
    borderColor: "#e6bcbc"
  },
  cardTitle: {
    color: "#2c241e",
    fontSize: 16,
    fontWeight: "700"
  },
  cardMeta: {
    marginTop: 6,
    color: "#6a5a4e"
  },
  logoutTitle: {
    color: "#8f3030",
    fontSize: 16,
    fontWeight: "700"
  }
});

