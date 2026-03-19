import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { ScreenShell } from "../../components/screen-shell";
import { useAuth } from "../../lib/auth";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("hanako@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    try {
      setError(null);
      await signIn(email, password);
      router.replace("/(tabs)/map");
    } catch {
      setError("ログインに失敗しました");
    }
  }

  return (
    <ScreenShell title="Login" body="Use the seeded account to enter the MVP flow.">
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonLabel}>ログイン</Text>
      </Pressable>
      <View style={styles.actions}>
        <Pressable onPress={() => router.push("/auth/signup")}>
          <Text style={styles.link}>新規登録へ</Text>
        </Pressable>
      </View>
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
  buttonLabel: {
    color: "#fffdf8",
    fontSize: 16,
    fontWeight: "700"
  },
  actions: {
    marginTop: 16,
    alignItems: "center"
  },
  link: {
    color: "#7a5c3e",
    fontWeight: "600"
  },
  error: {
    marginTop: 12,
    color: "#a23232"
  }
});

