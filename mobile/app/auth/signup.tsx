import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { router } from "expo-router";

import { ScreenShell } from "../../components/screen-shell";
import { useAuth } from "../../lib/auth";

export default function SignUpScreen() {
  const { startSignUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    try {
      setError(null);
      await startSignUp(email, password);
      router.push("/auth/verify");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "登録に失敗しました");
    }
  }

  return (
    <ScreenShell title="Sign Up" body="Create a new account to start onboarding.">
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholder="email@example.com"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="password"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={onSubmit}>
        <Text style={styles.label}>認証画面へ進む</Text>
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
