import { useLocalSearchParams, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ScreenShell } from "../../components/screen-shell";
import { getMapDetail, getMe, saveMap, toggleLikeMap } from "../../services/api";

export default function MapDetailScreen() {
  const { mapId } = useLocalSearchParams<{ mapId: string }>();
  const queryClient = useQueryClient();
  const mapQuery = useQuery({
    queryKey: ["map", mapId],
    queryFn: () => getMapDetail(mapId)
  });
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe
  });

  const saveMutation = useMutation({
    mutationFn: () => saveMap(mapId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["map", mapId] });
      void queryClient.invalidateQueries({ queryKey: ["me", "maps"] });
    }
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLikeMap(mapId, Boolean(mapQuery.data && "is_liked" in mapQuery.data && mapQuery.data.is_liked)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["map", mapId] });
    }
  });

  const map = mapQuery.data;
  const isOwner = Boolean(map && !("error" in map) && meQuery.data?.id === map.owner?.id);

  if (!map || "error" in map) {
    return <ScreenShell title="Map" body="Map not found." />;
  }

  return (
    <ScreenShell title={map.title} body={map.description ?? "No description"}>
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => saveMutation.mutate()}>
          <Text style={styles.label}>{map.is_saved ? "保存済み" : "保存する"}</Text>
        </Pressable>
        <Pressable style={styles.buttonAlt} onPress={() => likeMutation.mutate()}>
          <Text style={styles.labelAlt}>{map.is_liked ? "いいね解除" : "いいね"}</Text>
        </Pressable>
      </View>
      {isOwner ? (
        <Pressable style={styles.editButton} onPress={() => router.push(`/maps/${mapId}/edit`)}>
          <Text style={styles.editLabel}>編集する</Text>
        </Pressable>
      ) : null}
      <View style={styles.list}>
        {map.spots.map((spot) => (
          <Pressable key={spot.id} style={styles.card} onPress={() => router.push(`/spots/${spot.id}`)}>
            <Text style={styles.cardTitle}>{spot.name}</Text>
            <Text style={styles.cardMeta}>
              {spot.latitude.toFixed(3)}, {spot.longitude.toFixed(3)}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12
  },
  button: {
    borderRadius: 16,
    backgroundColor: "#7a5c3e",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  buttonAlt: {
    borderRadius: 16,
    backgroundColor: "#eadfcd",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  label: {
    color: "#fffdf8",
    fontWeight: "700"
  },
  labelAlt: {
    color: "#513f31",
    fontWeight: "700"
  },
  list: {
    marginTop: 16,
    gap: 12
  },
  editButton: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#f2e8d8",
    paddingVertical: 12,
    alignItems: "center"
  },
  editLabel: {
    color: "#513f31",
    fontWeight: "700"
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
    fontWeight: "700",
    fontSize: 16
  },
  cardMeta: {
    marginTop: 6,
    color: "#6a5a4e"
  }
});
