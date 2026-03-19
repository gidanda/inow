import { useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";

import { ImagePreviewCard } from "../../../components/image-preview-card";
import { ScreenShell } from "../../../components/screen-shell";
import { useImagePicker } from "../../../hooks/use-image-picker";
import { useAuth } from "../../../lib/auth";
import { uploadImageFromUri } from "../../../services/api";

const STEPS = [
  { key: "lastName", title: "姓", placeholder: "田中" },
  { key: "firstName", title: "名", placeholder: "花子" },
  { key: "birthDate", title: "生年月日", placeholder: "1998-01-15" },
  { key: "userId", title: "ユーザーID", placeholder: "hanako_map" },
  { key: "displayName", title: "表示名", placeholder: "花子" },
  { key: "profileImageUrl", title: "プロフィール画像URL", placeholder: "https://..." }
] as const;

export default function OnboardingStepScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const { onboardingDraft, updateOnboardingDraft, completeSignUp } = useAuth();
  const { imageUri, pickImage, setImageUri } = useImagePicker();
  const stepIndex = Math.max(0, Math.min(STEPS.length - 1, Number(step) - 1 || 0));
  const currentStep = STEPS[stepIndex];
  const isImageStep = currentStep.key === "profileImageUrl";
  const draftValue = onboardingDraft[currentStep.key] ?? "";
  const [value, setValue] = useState(String(draftValue));
  const [error, setError] = useState<string | null>(null);
  const isLast = stepIndex === STEPS.length - 1;

  const description = useMemo(
    () => `${stepIndex + 1} / ${STEPS.length} の入力です。`,
    [stepIndex]
  );

  async function onNext() {
    if (isImageStep && imageUri) {
      const uploadedImageUrl = await uploadImageFromUri(imageUri, "profile_image");
      updateOnboardingDraft({ profileImageUrl: uploadedImageUrl });
    } else {
      updateOnboardingDraft({ [currentStep.key]: value } as never);
    }
    if (!isLast) {
      router.push(`/auth/onboarding/${stepIndex + 2}`);
      return;
    }
    try {
      setError(null);
      await completeSignUp();
      router.replace("/(tabs)/map");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "登録完了に失敗しました");
    }
  }

  return (
    <ScreenShell title={currentStep.title} body={description}>
      {isImageStep ? (
        <ImagePreviewCard
          imageUri={imageUri ?? onboardingDraft.profileImageUrl ?? null}
          label="プロフィール画像"
          buttonLabel="画像を選択"
          onPick={() => {
            void pickImage();
          }}
        />
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={currentStep.placeholder}
          autoCapitalize={currentStep.key === "userId" ? "none" : "sentences"}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={() => void onNext()}>
        <Text style={styles.label}>{isLast ? "登録を完了" : "次へ"}</Text>
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
