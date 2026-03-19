import { useMemo, useState } from "react";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ImagePreviewCard } from "../../components/image-preview-card";
import { ScreenShell } from "../../components/screen-shell";
import { useImagePicker } from "../../hooks/use-image-picker";
import { usePlaceSearchQuery } from "../../hooks/use-place-search-query";
import { createSpot, getMyMaps, uploadImageFromUri } from "../../services/api";

export default function NewSpotScreen() {
  const queryClient = useQueryClient();
  const myMapsQuery = useQuery({
    queryKey: ["me", "maps"],
    queryFn: getMyMaps
  });
  const candidateMaps = useMemo(
    () => (myMapsQuery.data ?? []).filter((item) => item.type === "owned" || item.type === "default"),
    [myMapsQuery.data]
  );
  const [mapId, setMapId] = useState<string>("");
  const [sourceType, setSourceType] = useState<"manual" | "google_place">("manual");
  const [placeQuery, setPlaceQuery] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState<string | undefined>(undefined);
  const [latitude, setLatitude] = useState(35.703);
  const [longitude, setLongitude] = useState(139.579);
  const { imageUri, pickImage } = useImagePicker();

  const placesQuery = usePlaceSearchQuery(placeQuery, sourceType === "google_place");

  const createSpotMutation = useMutation({
    mutationFn: async () => {
      const imageUrl = imageUri ? await uploadImageFromUri(imageUri, "spot_image") : undefined;
      return createSpot({
        map_id: mapId,
        source_type: sourceType,
        google_place_id: googlePlaceId,
        name,
        formatted_address: address,
        comment,
        latitude,
        longitude,
        image_url: imageUrl,
        tags: []
      });
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["map", "spots"] });
      void queryClient.invalidateQueries({ queryKey: ["map", data.map_id] });
      router.replace(`/spots/${data.id}`);
    }
  });

  return (
    <ScreenShell title="New Spot" body="Add a manual spot to one of your maps.">
      <Text style={styles.label}>Target map</Text>
      {candidateMaps.map((item) => (
        <Pressable
          key={item.id}
          style={[styles.mapOption, mapId === item.id && styles.mapOptionActive]}
          onPress={() => setMapId(item.id)}
        >
          <Text style={styles.mapOptionText}>{item.title}</Text>
        </Pressable>
      ))}
      <Text style={styles.label}>Source type</Text>
      <View style={styles.switchRow}>
        <Pressable
          style={[styles.sourceButton, sourceType === "manual" && styles.sourceButtonActive]}
          onPress={() => setSourceType("manual")}
        >
          <Text style={styles.sourceButtonText}>Manual</Text>
        </Pressable>
        <Pressable
          style={[styles.sourceButton, sourceType === "google_place" && styles.sourceButtonActive]}
          onPress={() => setSourceType("google_place")}
        >
          <Text style={styles.sourceButtonText}>Google Place</Text>
        </Pressable>
      </View>
      {sourceType === "google_place" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Search a place"
            value={placeQuery}
            onChangeText={setPlaceQuery}
          />
          <View style={styles.placeList}>
            {(placesQuery.data?.results ?? []).map((place) => (
              <Pressable
                key={place.id}
                style={styles.placeCard}
                onPress={() => {
                  setGooglePlaceId(place.google_place_id);
                  setName(place.name);
                  setAddress(place.formatted_address);
                  setLatitude(place.latitude);
                  setLongitude(place.longitude);
                }}
              >
                <Text style={styles.placeTitle}>{place.name}</Text>
                <Text style={styles.placeMeta}>{place.formatted_address}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
      <TextInput style={styles.input} placeholder="Spot name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Comment"
        value={comment}
        onChangeText={setComment}
        multiline
      />
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
        onPress={() => createSpotMutation.mutate()}
      >
        <Text style={styles.buttonLabel}>スポットを追加</Text>
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
  switchRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10
  },
  sourceButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d9ccb8",
    backgroundColor: "#fffdf8",
    paddingVertical: 12,
    alignItems: "center"
  },
  sourceButtonActive: {
    borderColor: "#7a5c3e",
    backgroundColor: "#f2e8d8"
  },
  sourceButtonText: {
    color: "#2c241e",
    fontWeight: "700"
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
  placeList: {
    marginTop: 12,
    gap: 10
  },
  placeCard: {
    borderRadius: 14,
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#e7dccb",
    padding: 12
  },
  placeTitle: {
    color: "#2c241e",
    fontWeight: "700"
  },
  placeMeta: {
    marginTop: 4,
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
