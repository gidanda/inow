import { StyleSheet, Text, View } from "react-native";

type PlaceholderCardProps = {
  title: string;
  detail: string;
};

export function PlaceholderCard({ title, detail }: PlaceholderCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "#fffdf8",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e7dccb"
  },
  title: {
    color: "#2c241e",
    fontSize: 17,
    fontWeight: "700"
  },
  detail: {
    marginTop: 6,
    color: "#6a5a4e",
    fontSize: 14,
    lineHeight: 20
  }
});

