import React, { useEffect } from "react";

import { ColorSchemeName, Alert } from "react-native";
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

import * as Notifications from "expo-notifications";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { DeepLinkProvider, useDeepLink } from "@/providers/DeepLinkProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const API_URL = "https://api.even-took.com";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { setCardId } = useDeepLink();

  // 딥링크 처리 로직 추가
  useEffect(() => {
    // 앱이 이미 실행 중일 때 딥링크 처리
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("딥링크 수신 (앱 실행 중):", url);
      handleDeepLink(url);
    });

    // 앱이 실행되지 않은 상태에서 딥링크로 열렸을 때
    const getInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log("초기 딥링크 수신:", initialUrl);
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error("초기 URL 가져오기 오류:", error);
      }
    };
    getInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  // 딥링크 URL 처리 함수
  const handleDeepLink = (url: string) => {
    if (!url) return;
    console.log("딥링크 처리:", url);

    try {
      // URL 파싱하여 쿼리 파라미터 추출
      const urlObj = new URL(url);
      const urlString = urlObj.toString().replace("took://", "");
      const path = urlObj.pathname.replace("took://", "");
      const searchParams = new URLSearchParams(urlObj.search);
      const shouldSave = searchParams.get("save") === "true";

      // card-share/:id 경로 처리
      if (urlString.startsWith("card-share/")) {
        // 경로에서 card-share/ 부분을 제거하고 숫자만 추출
        const cardIdWithSlash = path.replace("card-share/", "");
        // 슬래시(/)를 제거하고 순수한 ID 값만 추출
        const cardId = cardIdWithSlash.replace(/\//g, "");

        if (cardId) {
          console.log(`카드 공유 화면으로 이동: ${cardId}`);

          // Context에 cardId 저장
          setCardId(cardId);

          // save=true 파라미터가 있으면 카드 저장 로직 실행
          if (shouldSave) {
            console.log(`카드 저장 요청: ${cardId}`);
            saveCardToServer(cardId);
          }

          router.replace(`/card-share/${cardId}`);
        }
      }
      // card-detail/:id 경로 처리
      else if (urlString.startsWith("card-detail/")) {
        // 경로에서 card-detail/ 부분을 제거하고 숫자만 추출
        const cardIdWithSlash = path.replace("card-detail/", "");
        // 슬래시(/)를 제거하고 순수한 ID 값만 추출
        const cardId = cardIdWithSlash.replace(/\//g, "");
        // type 파라미터 추출
        const type = searchParams.get("type") || "receivedcard";

        if (cardId) {
          console.log(`카드 상세 화면으로 이동: ${cardId}, 타입: ${type}`);

          // Context에 cardId 저장
          setCardId(cardId);

          router.replace(`/card-detail/${cardId}`);
        }
      }
    } catch (error) {
      console.error("딥링크 처리 오류:", error);
    }
  };

  // 카드 저장 함수
  const saveCardToServer = async (cardId: string) => {
    try {
      // 앱에서 사용하는 API 클라이언트나 fetch 함수 사용
      const response = await fetch(`${API_URL}/api/card/receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (await getAuthToken()), // 인증 토큰 가져오기
        },
        body: JSON.stringify({ cardId }),
      });

      const data = await response.json();
      console.log("카드 저장 결과:", data);

      // 성공 알림 표시
      Alert.alert("알림", "명함이 저장되었습니다.");
    } catch (error) {
      console.error("카드 저장 오류:", error);
      Alert.alert("오류", "명함 저장에 실패했습니다.");
    }
  };

  // 인증 토큰 가져오기 함수
  const getAuthToken = async () => {
    // 여기에 앱에서 사용하는 인증 토큰 저장소에서 토큰 가져오기 로직 구현
    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("토큰:", token);
      return token;
    } catch (error) {
      console.error("토큰 가져오기 오류:", error);
      return "";
    }
  };

  // 폰트 로드 후 스플래시 화면 숨김
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <NotificationProvider>
      <WebViewProvider>
        <OnboardingProvider>
          <DeepLinkProvider>
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
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
