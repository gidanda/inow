import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { useImagePicker } from "../../../hooks/use-image-picker";
import { useAuth } from "../../../lib/auth";
import { uploadImageFromUri } from "../../../services/api";

const STEPS = [
  { key: "lastName", title: "姓", placeholder: "田中", caption: "Circle に表示する基本プロフィールです。" },
  { key: "firstName", title: "名", placeholder: "花子", caption: "親しみやすい表示名のベースになります。" },
  { key: "birthDate", title: "生年月日", placeholder: "1998-01-15", caption: "年齢帯に応じたつながりを最適化します。" },
  { key: "userId", title: "ユーザーID", placeholder: "hanako_map", caption: "検索やプロフィール共有に使う公開IDです。" },
  { key: "displayName", title: "表示名", placeholder: "花子", caption: "マップやスポットに出る名前を決めます。" },
  { key: "profileImageUrl", title: "プロフィール画像", placeholder: "https://...", caption: "最後に顔の見えるプロフィールを整えます。" }
] as const;

export default function OnboardingStepScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const { onboardingDraft, updateOnboardingDraft, completeSignUp } = useAuth();
  const { imageUri, pickImage } = useImagePicker();
  const stepIndex = Math.max(0, Math.min(STEPS.length - 1, Number(step) - 1 || 0));
  const currentStep = STEPS[stepIndex];
  const isImageStep = currentStep.key === "profileImageUrl";
  const draftValue = onboardingDraft[currentStep.key] ?? "";
  const [value, setValue] = useState(String(draftValue));
  const [error, setError] = useState<string | null>(null);
  const isLast = stepIndex === STEPS.length - 1;

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formShell}>
            <Text style={styles.progressText}>
              {stepIndex + 1}/{STEPS.length}
            </Text>
            <Text style={styles.formTitle}>{currentStep.title}を入力</Text>
            <Text style={styles.formCaption}>{currentStep.caption}</Text>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{currentStep.title}</Text>
              {isImageStep ? (
                <Pressable
                  style={styles.imagePanel}
                  onPress={() => {
                    void pickImage();
                  }}
                >
                  {imageUri ?? onboardingDraft.profileImageUrl ? (
                    <Image source={{ uri: imageUri ?? onboardingDraft.profileImageUrl }} style={styles.imagePreview} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imagePlaceholderTitle}>プロフィール画像を追加</Text>
                      <Text style={styles.imagePlaceholderBody}>タップして写真を選択</Text>
                    </View>
                  )}
                </Pressable>
              ) : (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={setValue}
                  placeholder={currentStep.placeholder}
                  placeholderTextColor="#b8aaa2"
                  autoCapitalize={currentStep.key === "userId" ? "none" : "sentences"}
                />
              )}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable style={styles.primaryButton} onPress={() => void onNext()}>
              <Text style={styles.primaryButtonLabel}>{isLast ? "Complete" : "Continue"}</Text>
            </Pressable>

            {stepIndex > 0 ? (
              <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
                <Text style={styles.secondaryButtonLabel}>Back</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.secondaryButton} onPress={() => router.replace("/auth/login")}>
                <Text style={styles.secondaryButtonLabel}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ece7e2"
  },
  keyboardWrap: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 18
  },
  formShell: {
    borderRadius: 34,
    backgroundColor: "#f8f6f3",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20
  },
  progressText: {
    color: "#c9b7ae",
    fontSize: 13,
    fontWeight: "700"
  },
  formTitle: {
    marginTop: 8,
    color: "#1f1615",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800"
  },
  formCaption: {
    marginTop: 10,
    color: "#7f7068",
    fontSize: 14,
    lineHeight: 21
  },
  fieldBlock: {
    marginTop: 18
  },
  fieldLabel: {
    color: "#2f2523",
    fontSize: 13,
    fontWeight: "700"
  },
  input: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ece3dd",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#1f1615",
    fontSize: 15
  },
  imagePanel: {
    marginTop: 10,
    height: 132,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#f1ece7"
  },
  imagePreview: {
    width: "100%",
    height: "100%"
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5eee8"
  },
  imagePlaceholderTitle: {
    color: "#3a2b27",
    fontSize: 15,
    fontWeight: "700"
  },
  imagePlaceholderBody: {
    marginTop: 6,
    color: "#8c7c74",
    fontSize: 12
  },
  primaryButton: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: "#111111",
    paddingVertical: 16,
    alignItems: "center"
  },
  primaryButtonLabel: {
    color: "#fffdf8",
    fontSize: 15,
    fontWeight: "800"
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: "#efefef",
    paddingVertical: 15,
    alignItems: "center"
  },
  secondaryButtonLabel: {
    color: "#1d1514",
    fontSize: 14,
    fontWeight: "700"
  },
  error: {
    marginTop: 12,
    color: "#a23232",
    fontSize: 13,
    lineHeight: 18
  }
});
