import { Stack } from "expo-router";

import { AppProviders } from "../components/app-providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
