import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";

import { ImagePreviewCard } from "../../../components/image-preview-card";
import { ScreenShell } from "../../../components/screen-shell";
import { useImagePicker } from "../../../hooks/use-image-picker";
import { getMapDetail, getMe, updateMap, uploadImageFromUri } from "../../../services/api";

export default function EditMapScreen() {
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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const { imageUri, pickImage, setImageUri } = useImagePicker();

  useEffect(() => {
    const map = mapQuery.data;
    if (!map || "error" in map) return;
    setTitle(map.title);
    setDescription(map.description ?? "");
    setVisibility(map.visibility === "private" ? "private" : "public");
    setImageUri(map.cover_image_url ?? null);
  }, [mapQuery.data, setImageUri]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const coverImageUrl =
        imageUri && imageUri.startsWith("http") ? imageUri : imageUri ? await uploadImageFromUri(imageUri, "map_cover") : undefined;
      return updateMap(mapId, {
        title,
        description,
        cover_image_url: coverImageUrl,
        visibility
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["map", mapId] });
      void queryClient.invalidateQueries({ queryKey: ["me", "maps"] });
      router.replace(`/maps/${mapId}`);
    }
  });

  const map = mapQuery.data;
  const isOwner = Boolean(map && !("error" in map) && meQuery.data?.id === map.owner?.id);

  if (!map || "error" in map) {
    return <ScreenShell title="Edit Map" body="Map not found." />;
  }

  if (!isOwner) {
    return <ScreenShell title="Edit Map" body="You cannot edit this map." />;
  }

  return (
    <ScreenShell title="Edit Map" body="Update your map metadata and visibility.">
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <ImagePreviewCard
        imageUri={imageUri}
        label="Cover image"
        buttonLabel="画像を選択"
        onPick={() => {
          void pickImage();
        }}
      />
      <Pressable style={styles.toggle} onPress={() => setVisibility(visibility === "public" ? "private" : "public")}>
        <Text style={styles.toggleText}>Visibility: {visibility}</Text>
      </Pressable>
      <Pressable style={[styles.button, !title && styles.buttonDisabled]} onPress={() => saveMutation.mutate()} disabled={!title}>
        <Text style={styles.buttonLabel}>変更を保存</Text>
      </Pressable>
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
  multiline: {
    minHeight: 120,
    textAlignVertical: "top"
  },
  toggle: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: "#eadfcd",
    padding: 14
  },
  toggleText: {
    color: "#513f31",
    fontWeight: "700"
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
