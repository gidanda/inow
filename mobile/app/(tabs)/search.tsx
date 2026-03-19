import { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { router } from "expo-router";

import { ScreenShell } from "../../components/screen-shell";
import { useSearchQuery } from "../../hooks/use-search-query";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const searchQuery = useSearchQuery(query);

  return (
    <ScreenShell
      title="Search"
      body="Map-first search will be the default, with spot and user search as secondary tabs."
    >
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search public maps"
        style={styles.input}
      />
      <View style={styles.results}>
        {(searchQuery.data?.maps ?? []).map((item) => (
          <Pressable key={item.id} style={styles.row} onPress={() => router.push(`/maps/${item.id}`)}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowMeta}>Map result</Text>
          </Pressable>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d9ccb8",
    backgroundColor: "#fffdf8",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  results: {
    marginTop: 16,
    gap: 12
  },
  row: {
    borderRadius: 16,
    backgroundColor: "#fffdf8",
    padding: 14,
    borderWidth: 1,
    borderColor: "#e7dccb"
  },
  rowTitle: {
    color: "#2c241e",
    fontSize: 16,
    fontWeight: "700"
  },
  rowMeta: {
    marginTop: 4,
    color: "#6a5a4e",
    fontSize: 13
  }
});
