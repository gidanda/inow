import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { ScreenShell } from "../../components/screen-shell";
import { getMyMaps } from "../../services/api";

export default function SavedMapsScreen() {
  const mapsQuery = useQuery({
    queryKey: ["me", "maps"],
    queryFn: getMyMaps
  });

  const maps = mapsQuery.data ?? [];
  const defaultMaps = maps.filter((item) => item.type === "default");
  const savedMaps = maps.filter((item) => item.type === "saved");

  return (
    <ScreenShell title="Saved Maps" body="Default maps and saved public maps live here.">
      <Text style={styles.sectionTitle}>Default</Text>
      <View style={styles.list}>
        {defaultMaps.map((item) => (
          <Pressable key={item.id} style={styles.card} onPress={() => router.push(`/maps/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>private · default</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Saved</Text>
      <View style={styles.list}>
        {savedMaps.map((item) => (
          <Pressable key={item.id} style={styles.card} onPress={() => router.push(`/maps/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>saved map</Text>
          </Pressable>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: 16,
    color: "#2c241e",
    fontSize: 16,
    fontWeight: "700"
  },
  list: {
    marginTop: 12,
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
  },
  cardMeta: {
    marginTop: 6,
    color: "#6a5a4e"
  }
});

