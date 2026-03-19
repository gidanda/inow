import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ImagePreviewCard } from "../../../components/image-preview-card";
import { ScreenShell } from "../../../components/screen-shell";
import { useImagePicker } from "../../../hooks/use-image-picker";
import { getMe, getMyMaps, getSpotDetail, updateSpot, uploadImageFromUri } from "../../../services/api";

export default function EditSpotScreen() {
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

  const editableMaps = useMemo(
    () => (myMapsQuery.data ?? []).filter((item) => item.type === "owned" || item.type === "default"),
    [myMapsQuery.data]
  );

  const [mapId, setMapId] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [latitude, setLatitude] = useState(35.703);
  const [longitude, setLongitude] = useState(139.579);
  const { imageUri, pickImage, setImageUri } = useImagePicker();

  useEffect(() => {
    const spot = spotQuery.data;
    if (!spot || "error" in spot) return;
    setMapId(spot.map.id);
    setName(spot.name);
    setAddress(spot.formatted_address ?? "");
    setComment(spot.comment ?? "");
    setLatitude(spot.latitude);
    setLongitude(spot.longitude);
    setImageUri(spot.image_url ?? null);
  }, [spotQuery.data, setImageUri]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const imageUrl =
        imageUri && imageUri.startsWith("http") ? imageUri : imageUri ? await uploadImageFromUri(imageUri, "spot_image") : undefined;
      return updateSpot(spotId, {
        map_id: mapId,
        name,
        formatted_address: address,
        comment,
        latitude,
        longitude,
        image_url: imageUrl
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["spot", spotId] });
      void queryClient.invalidateQueries({ queryKey: ["map", "spots"] });
      void queryClient.invalidateQueries({ queryKey: ["map", mapId] });
      router.replace(`/spots/${spotId}`);
    }
  });

  const spot = spotQuery.data;
  const isOwner = Boolean(spot && !("error" in spot) && meQuery.data?.id === spot.owner?.id);

  if (!spot || "error" in spot) {
    return <ScreenShell title="Edit Spot" body="Spot not found." />;
  }

  if (!isOwner) {
    return <ScreenShell title="Edit Spot" body="You cannot edit this spot." />;
  }

  return (
    <ScreenShell title="Edit Spot" body="Update the spot details on your map.">
      <Text style={styles.label}>Target map</Text>
      {editableMaps.map((item) => (
        <Pressable
          key={item.id}
          style={[styles.mapOption, mapId === item.id && styles.mapOptionActive]}
          onPress={() => setMapId(item.id)}
        >
          <Text style={styles.mapOptionText}>{item.title}</Text>
        </Pressable>
      ))}
      <TextInput style={styles.input} placeholder="Spot name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Comment"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <View style={styles.coordinates}>
        <Text style={styles.coordinateText}>Lat: {latitude.toFixed(3)}</Text>
        <Text style={styles.coordinateText}>Lng: {longitude.toFixed(3)}</Text>
      </View>
      <ImagePreviewCard
        imageUri={imageUri}
        label="Spot image"
        buttonLabel="画像を選択"
        onPick={() => {
          void pickImage();
        }}
      />
      <Pressable
        style={[styles.button, (!mapId || !name) && styles.buttonDisabled]}
        disabled={!mapId || !name}
        onPress={() => saveMutation.mutate()}
      >
        <Text style={styles.buttonLabel}>変更を保存</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  label: {
    marginTop: 16,
    color: "#2c241e",
    fontWeight: "700"
  },
  mapOption: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d9ccb8",
    backgroundColor: "#fffdf8",
    padding: 12
  },
  mapOptionActive: {
    borderColor: "#7a5c3e",
    backgroundColor: "#f2e8d8"
  },
  mapOptionText: {
    color: "#2c241e",
    fontWeight: "600"
  },
  input: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d9ccb8",
    backgroundColor: "#fffdf8",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: "top"
  },
  coordinates: {
    marginTop: 12,
    flexDirection: "row",
    gap: 16
  },
  coordinateText: {
    color: "#6a5a4e",
    fontSize: 13
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#7a5c3e",
    paddingVertical: 14,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonLabel: {
    color: "#fffdf8",
    fontWeight: "700"
  }
});
