import React, { useEffect, useState } from "react";

import { ColorSchemeName } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

import { OnboardingProvider } from "@/providers/OnBoardingProvider";
import { WebViewProvider } from "@/providers/WebViewProvider";
import NotificationProvider from "@/providers/NotificationContext";
import { useNotification } from "@/providers/NotificationContext";

import * as Notifications from "expo-notifications";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { DeepLinkProvider, useDeepLink } from "@/providers/DeepLinkProvider";
import { handleDeepLink } from "@/utils/deepLinkHandler";
import { requestLocationPermission } from "@/utils/permissionUtils";

WebBrowser.maybeCompleteAuthSession(); // 설명 - 웹브라우저 세션 자동 완료 설정 추가

// 푸시 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 알림 표시 여부
    shouldPlaySound: true, // 소리 재생 여부
    shouldSetBadge: false, // 배지 표시 여부
  }),
});

// 앱 시작 시 스플래시 화면 자동 숨김 방지
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

// 위치 권한 요청을 담당하는 내부 컴포넌트
function LocationPermissionHandler() {
  const notification = useNotification();
  const [permissionRequested, setPermissionRequested] = useState(false);

  // 알림 상태가 설정된 후 위치 권한 요청
  useEffect(() => {
    // 이미 요청했다면 다시 요청하지 않음
    if (permissionRequested) return;

    // 알림 토큰이 설정된 경우 또는 오류가 발생한 경우 (알림 권한 절차가 완료된 경우)
    if (notification.expoPushToken !== null || notification.error !== null) {
      console.log("알림 권한 설정 완료 후 위치 권한 요청 시작");

      // 약간의 지연을 주어 알림 권한 처리가 완전히 완료되도록 함
      const timer = setTimeout(() => {
        requestLocationPermission();
        setPermissionRequested(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [notification.expoPushToken, notification.error, permissionRequested]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { setCardId } = useDeepLink();

  // 폰트 로드 후 스플래시 화면 숨김
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // 딥링크 처리 로직
  useEffect(() => {
    // 앱이 이미 실행 중일 때 딥링크 처리
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("딥링크 수신 (앱 실행 중):", url);
      handleDeepLink(url, setCardId);
    });

    // 앱이 실행되지 않은 상태에서 딥링크로 열렸을 때
    const getInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log("초기 딥링크 수신:", initialUrl);
          handleDeepLink(initialUrl, setCardId);
        }
      } catch (error) {
        console.error("초기 URL 가져오기 오류:", error);
      }
    };
    getInitialURL();

    return () => {
      subscription.remove();
    };
  }, [setCardId]);

  if (!loaded) {
    return null;
  }

  return (
    <NotificationProvider>
      <WebViewProvider>
        <OnboardingProvider>
          <DeepLinkProvider>
            <LocationPermissionHandler />
            <InnerRootLayout colorScheme={colorScheme} />
          </DeepLinkProvider>
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
        <Stack.Screen
          name="card-share"
          options={{
            headerShown: false,
            headerStyle: {
              backgroundColor: "black",
            },
          }}
        />
        <Stack.Screen
          name="card-detail"
          options={{
            headerShown: false,
            headerStyle: {
              backgroundColor: "black",
            },
          }}
        />
        <Stack.Screen
          name="card-notes"
          options={{
            headerShown: false,
            headerStyle: {
              backgroundColor: "black",
            },
          }}
        />
        <Stack.Screen
          name="received-interesting"
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
