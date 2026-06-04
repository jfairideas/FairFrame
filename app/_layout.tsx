import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";
import { SessionProvider } from "../src/context/SessionContext";
import { colors } from "../src/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
    <SessionProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      />
    </SessionProvider>
    </AuthProvider>
  );
}
