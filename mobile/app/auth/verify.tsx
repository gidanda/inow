import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { router } from "expo-router";

import { ScreenShell } from "../../components/screen-shell";
import { useAuth } from "../../lib/auth";

export default function VerifyScreen() {
  const { verifySignUp } = useAuth();
  const [code, setCode] = useState("123456");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    try {
      setError(null);
      await verifySignUp(code);
      router.push("/auth/onboarding/1");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "認証に失敗しました");
    }
  }

  return (
    <ScreenShell title="Verify" body="Use the seeded verification code 123456 for the in-memory flow.">
      <TextInput style={styles.input} value={code} onChangeText={setCode} keyboardType="number-pad" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={onSubmit}>
        <Text style={styles.label}>オンボーディングへ</Text>
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
  button: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#7a5c3e",
    paddingVertical: 14,
    alignItems: "center"
  },
  label: {
    color: "#fffdf8",
    fontWeight: "700"
  },
  error: {
    marginTop: 12,
    color: "#a23232"
  }
});
