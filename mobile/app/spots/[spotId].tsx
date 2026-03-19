import { useLocalSearchParams, router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ScreenShell } from "../../components/screen-shell";
import { copySpot, getMe, getMyMaps, getSpotDetail } from "../../services/api";

export default function SpotDetailScreen() {
  const { spotId } = useLocalSearchParams<{ spotId: string }>();
  const queryClient = useQueryClient();
  const spotQuery = useQuery({
    queryKey: ["spot", spotId],
    queryFn: () => getSpotDetail(spotId)
  });
  const myMapsQuery = useQuery({
    queryKey: ["me", "maps"],
    queryFn: getMyMaps
  });
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe
  });
  const copyMutation = useMutation({
    mutationFn: (targetMapId: string) => copySpot(spotId, targetMapId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me", "maps"] });
    }
  });

  const spot = spotQuery.data;
  const targetMap = (myMapsQuery.data ?? []).find((item) => item.type === "default") ?? myMapsQuery.data?.[0];
  const isOwner = Boolean(spot && !("error" in spot) && meQuery.data?.id === spot.owner?.id);

  if (!spot || "error" in spot) {
    return <ScreenShell title="Spot" body="Spot not found." />;
  }

  return (
    <ScreenShell title={spot.name} body={spot.comment ?? spot.formatted_address ?? "No description"}>
      <Text style={styles.address}>{spot.formatted_address ?? "No address"}</Text>
      <Pressable style={styles.linkButton} onPress={() => router.push(`/maps/${spot.map.id}`)}>
        <Text style={styles.linkText}>投稿元マップ: {spot.map.title}</Text>
      </Pressable>
      {isOwner ? (
        <Pressable style={styles.editButton} onPress={() => router.push(`/spots/${spotId}/edit`)}>
          <Text style={styles.editText}>編集する</Text>
        </Pressable>
      ) : null}
      {targetMap ? (
        <Pressable style={styles.copyButton} onPress={() => copyMutation.mutate(targetMap.id)}>
          <Text style={styles.copyText}>「{targetMap.title}」に追加</Text>
        </Pressable>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  address: {
    marginTop: 16,
    color: "#6a5a4e",
    fontSize: 15
  },
  linkButton: {
    marginTop: 16
  },
  linkText: {
    color: "#7a5c3e",
    fontWeight: "700"
  },
  editButton: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#f2e8d8",
    paddingVertical: 12,
    alignItems: "center"
  },
  editText: {
    color: "#513f31",
    fontWeight: "700"
  },
  copyButton: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: "#7a5c3e",
    paddingVertical: 14,
    alignItems: "center"
  },
  copyText: {
    color: "#fffdf8",
    fontWeight: "700"
  }
});
