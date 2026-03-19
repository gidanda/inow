import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../components/screen-shell";
import { useBlocksQuery } from "../../hooks/use-blocks-query";
import { setBlockedUser } from "../../services/api";

export default function BlockSettingsScreen() {
  const blocksQuery = useBlocksQuery();
  const queryClient = useQueryClient();

  const unblockMutation = useMutation({
    mutationFn: (userId: string) => setBlockedUser(userId, true),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me", "blocks"] });
    }
  });

  const blocks = blocksQuery.data?.blocks ?? [];

  return (
    <ScreenShell title="Blocked Users" body="Block relationships configured on this account.">
      <View style={styles.list}>
        {blocks.map((block) => (
          <View key={block.user_id} style={styles.card}>
            <Text style={styles.cardTitle}>{block.user_id}</Text>
            <Pressable style={styles.unblockButton} onPress={() => unblockMutation.mutate(block.user_id)}>
              <Text style={styles.unblockText}>解除</Text>
            </Pressable>
          </View>
        ))}
        {blocks.length === 0 ? <Text style={styles.empty}>No blocked users.</Text> : null}
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
    borderColor: "#e7dccb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardTitle: {
    color: "#2c241e",
    fontWeight: "700"
  },
  unblockButton: {
    borderRadius: 999,
    backgroundColor: "#eadfcd",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  unblockText: {
    color: "#513f31",
    fontWeight: "700"
  },
  empty: {
    color: "#6a5a4e"
  }
});

