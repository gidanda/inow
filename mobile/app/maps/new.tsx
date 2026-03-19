import { useState } from "react";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";

import { ImagePreviewCard } from "../../components/image-preview-card";
import { ScreenShell } from "../../components/screen-shell";
import { useImagePicker } from "../../hooks/use-image-picker";
import { createMap, uploadImageFromUri } from "../../services/api";

export default function NewMapScreen() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const { imageUri, pickImage } = useImagePicker();

  const createMapMutation = useMutation({
    mutationFn: async () => {
      const coverImageUrl = imageUri ? await uploadImageFromUri(imageUri, "map_cover") : undefined;
      return createMap({
        title,
        description,
        cover_image_url: coverImageUrl,
        visibility,
        tags: []
      });
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["me", "maps"] });
      router.replace(`/maps/${data.id}`);
    }
  });

  return (
    <ScreenShell title="New Map" body="Create a new map to collect spots around a theme or area.">
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
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
      <Pressable
        style={[styles.button, !title && styles.buttonDisabled]}
        onPress={() => createMapMutation.mutate()}
        disabled={!title}
      >
        <Text style={styles.buttonLabel}>マップを作成</Text>
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
