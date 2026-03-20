import { PropsWithChildren } from "react";
import { router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

type ScreenShellProps = PropsWithChildren<{
  title?: string;
  body?: string;
  showBackButton?: boolean;
  backLabel?: string;
  showHeader?: boolean;
}>;

export function ScreenShell({
  title,
  body,
  children,
  showBackButton = false,
  backLabel = "戻る",
  showHeader = true
}: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {showBackButton ? (
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backLabel}>{backLabel}</Text>
          </Pressable>
        ) : null}
        {showHeader ? (
          <>
            <Text style={styles.eyebrow}>inow</Text>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {body ? <Text style={styles.body}>{body}</Text> : null}
          </>
        ) : null}
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
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#eadfcd"
  },
  backLabel: {
    color: "#513f31",
    fontWeight: "700"
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
