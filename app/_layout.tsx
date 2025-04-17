import React, { useEffect, useRef } from "react";

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
import { saveCardToServer } from "@/api/cardSave";

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { setCardId } = useDeepLink();

  // 이미 처리된 딥링크 URL 저장 (무한 루프 방지)
  const processedLinks = useRef<Set<string>>(new Set());
  // 딥링크 처리 중인지 여부
  const isProcessingDeepLink = useRef<boolean>(false);
  // 현재 세션에서 저장한 카드 ID 추적
  const savedCardIds = useRef<Set<string>>(new Set());

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
  const handleDeepLink = async (url: string) => {
    if (!url) return;

    // 이미 처리 중인 경우 무시 (동시에 여러 번 처리 방지)
    if (isProcessingDeepLink.current) {
      console.log("딥링크 처리 중...");
      return;
    }

    // 딥링크 URL에서 save 파라미터 제거
    const normalizedUrl = url.split("?")[0];

    // 이미 처리된 링크인지 확인 (파라미터를 제외한 기본 URL로 확인)
    if (processedLinks.current.has(normalizedUrl)) {
      console.log("이미 처리된 딥링크:", normalizedUrl);
      return;
    }

    console.log("딥링크 처리:", url);

    // 처리 상태 설정 및 처리된 링크에 즉시 추가
    isProcessingDeepLink.current = true;
    processedLinks.current.add(normalizedUrl);

    try {
      // URL 파싱하여 쿼리 파라미터 추출
      const urlObj = new URL(url);
      const urlString = urlObj.toString().replace("took://", "");
      const path = urlObj.pathname.replace("took://", "");
      const searchParams = new URLSearchParams(urlObj.search);
      const shouldSave = searchParams.get("save") === "true";

      // received/interesting 경로 처리 (흥미로운 명함)
      if (
        urlString.startsWith("received/interesting") ||
        path.includes("received/interesting")
      ) {
        console.log("흥미로운 명함 화면으로 이동");
        // 라우터 경로는 파일 시스템의 실제 경로와 일치해야 함
        router.replace("/received-interesting" as any);
        isProcessingDeepLink.current = false;
        return;
      }

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

          // save=true 파라미터가 있고 아직 저장하지 않은 카드인 경우에만 저장
          if (shouldSave && !savedCardIds.current.has(cardId)) {
            console.log(`카드 저장 요청: ${cardId}`);
            // 저장된 카드 목록에 추가
            savedCardIds.current.add(cardId);

            // 카드 저장 시도 (별도 스레드에서 처리)
            try {
              await saveCardToServer(cardId);
            } catch (error) {
              console.error("카드 저장 중 오류:", error);
              // 오류 발생 시 저장 목록에서 제거하여 재시도 가능하게 함
              savedCardIds.current.delete(cardId);
            }
          }

          // 무조건 파라미터 없는 깨끗한 URL로 라우팅
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
    } finally {
      isProcessingDeepLink.current = false;
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
