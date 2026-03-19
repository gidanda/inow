import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";

import { completeOnboarding, confirmVerification, login, setApiAuthToken, signUp } from "../services/api";

const AUTH_TOKEN_KEY = "inow_auth_token";

type OnboardingDraft = {
  email: string;
  password: string;
  signupSessionId: string | null;
  lastName: string;
  firstName: string;
  birthDate: string;
  userId: string;
  displayName: string;
  profileImageUrl: string;
};

type AuthContextValue = {
  authToken: string | null;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  startSignUp: (email: string, password: string) => Promise<void>;
  verifySignUp: (code: string) => Promise<void>;
  updateOnboardingDraft: (patch: Partial<OnboardingDraft>) => void;
  completeSignUp: () => Promise<void>;
  onboardingDraft: OnboardingDraft;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingDraft>({
    email: "",
    password: "",
    signupSessionId: null,
    lastName: "",
    firstName: "",
    birthDate: "",
    userId: "",
    displayName: "",
    profileImageUrl: ""
  });

  useEffect(() => {
    async function load() {
      const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      setAuthToken(storedToken);
      setApiAuthToken(storedToken);
      setIsReady(true);
    }

    void load();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authToken,
      isReady,
      async signIn(email: string, password: string) {
        const result = await login(email, password);
        if ("error" in result) {
          throw new Error("Login failed");
        }
        setAuthToken(result.access_token);
        setApiAuthToken(result.access_token);
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.access_token);
      },
      async startSignUp(email: string, password: string) {
        const result = await signUp(email, password);
        if ("error" in result) {
          throw new Error(result.error.message);
        }
        setOnboardingDraft((current) => ({
          ...current,
          email,
          password,
          signupSessionId: result.signup_session_id
        }));
      },
      async verifySignUp(code: string) {
        if (!onboardingDraft.signupSessionId) {
          throw new Error("Signup session is missing");
        }
        const result = await confirmVerification(onboardingDraft.signupSessionId, code);
        if ("error" in result) {
          throw new Error(result.error.message);
        }
      },
      updateOnboardingDraft(patch: Partial<OnboardingDraft>) {
        setOnboardingDraft((current) => ({ ...current, ...patch }));
      },
      async completeSignUp() {
        if (!onboardingDraft.signupSessionId) {
          throw new Error("Signup session is missing");
        }
        const result = await completeOnboarding({
          signup_session_id: onboardingDraft.signupSessionId,
          last_name: onboardingDraft.lastName,
          first_name: onboardingDraft.firstName,
          birth_date: onboardingDraft.birthDate,
          user_id: onboardingDraft.userId,
          display_name: onboardingDraft.displayName,
          profile_image_url: onboardingDraft.profileImageUrl || undefined
        });
        if ("error" in result) {
          throw new Error(result.error.message);
        }
        setAuthToken(result.access_token);
        setApiAuthToken(result.access_token);
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.access_token);
      },
      onboardingDraft,
      async signOut() {
        setAuthToken(null);
        setApiAuthToken(null);
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      }
    }),
    [authToken, isReady, onboardingDraft]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
