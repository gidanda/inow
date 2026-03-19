import { PropsWithChildren } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

type ScreenShellProps = PropsWithChildren<{
  title: string;
  body: string;
}>;

export function ScreenShell({ title, body, children }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>inow</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f4ea"
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#f7f4ea"
  },
  eyebrow: {
    color: "#7a5c3e",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  title: {
    marginTop: 8,
    color: "#1f1a17",
    fontSize: 30,
    fontWeight: "700"
  },
  body: {
    marginTop: 12,
    color: "#54463b",
    fontSize: 16,
    lineHeight: 24
  }
});

