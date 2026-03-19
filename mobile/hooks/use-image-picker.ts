import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export function useImagePicker() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  async function pickImage() {
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Photo library permission is required");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        return result.assets[0].uri;
      }

      return null;
    } finally {
      setIsPicking(false);
    }
  }

  return {
    imageUri,
    isPicking,
    setImageUri,
    pickImage
  };
}
