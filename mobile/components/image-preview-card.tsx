import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type ImagePreviewCardProps = {
  imageUri: string | null;
  label: string;
  buttonLabel: string;
  onPick: () => void;
};

export function ImagePreviewCard({
  imageUri,
  label,
  buttonLabel,
  onPick
}: ImagePreviewCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : <View style={styles.placeholder} />}
      <Pressable style={styles.button} onPress={onPick}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16
  },
  label: {
    color: "#2c241e",
    fontWeight: "700"
  },
  image: {
    marginTop: 10,
    width: "100%",
    height: 180,
    borderRadius: 16
  },
  placeholder: {
    marginTop: 10,
    height: 180,
    borderRadius: 16,
    backgroundColor: "#eadfcd",
    borderWidth: 1,
    borderColor: "#d9ccb8"
  },
  button: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#eadfcd",
    paddingVertical: 12,
    alignItems: "center"
  },
  buttonText: {
    color: "#513f31",
    fontWeight: "700"
  }
});
