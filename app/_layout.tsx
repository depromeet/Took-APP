import React, { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

import { ColorSchemeName } from "react-native";
import {
  OnboardingProvider,
  useOnboarding,
} from "@/providers/OnBoardingProvider";
import { WebViewProvider } from "@/providers/WebViewProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <WebViewProvider>
      <OnboardingProvider>
        <InnerRootLayout colorScheme={colorScheme} />
      </OnboardingProvider>
    </WebViewProvider>
  );
}

function InnerRootLayout({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const { isOnboarded } = useOnboarding();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {isOnboarded ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
              headerStyle: {
                backgroundColor: "black",
              },
            }}
          />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
