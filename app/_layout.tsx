import React, { useEffect, useState } from "react";
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
import { OnboardingProvider } from "@/providers/OnBoardingProvider";
import { WebViewProvider } from "@/providers/WebViewProvider";
import NotificationProvider from "@/providers/NotificationContext";

import * as Notifications from "expo-notifications";
import * as WebBrowser from "expo-web-browser";
import getPushTokens from "@/utils/getPushTokens";

WebBrowser.maybeCompleteAuthSession(); // 설명 - 웹브라우저 세션 자동 완료 설정 추가

// 푸시 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 알림 표시 여부
    shouldPlaySound: false, // 소리 재생 여부
    shouldSetBadge: false, // 배지 표시 여부
  }),
});

// 앱 시작 시 스플래시 화면 자동 숨김 방지
SplashScreen.preventAutoHideAsync();

// 푸시 알림 토큰 가져오기
getPushTokens();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 앱 초기화 작업 (필요한 경우)
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초로 줄임
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (loaded && appReady) {
      // 폰트 로드와 앱 준비가 모두 완료되면 스플래시 숨기기
      SplashScreen.hideAsync();
    }
  }, [loaded, appReady]);

  // 폰트가 아직 로드되지 않았거나 앱 준비가 안 됐으면 splash를 계속 보여줌.
  if (!loaded || !appReady) {
    return null;
  }

  return (
    <NotificationProvider>
      <WebViewProvider>
        <OnboardingProvider>
          <InnerRootLayout colorScheme={colorScheme} />
        </OnboardingProvider>
      </WebViewProvider>
    </NotificationProvider>
  );
}

interface InnerRootLayoutProps {
  readonly colorScheme: ColorSchemeName;
}

function InnerRootLayout({ colorScheme }: InnerRootLayoutProps) {
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            headerStyle: {
              backgroundColor: "black",
            },
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
