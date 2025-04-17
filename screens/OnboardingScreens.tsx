import { WEBVIEW_URL } from "../config";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { useContext, useRef, useEffect } from "react";
import { WebViewContext } from "@/providers/WebViewProvider";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useOnboarding } from "@/providers/OnBoardingProvider";
import { router } from "expo-router";
import CustomWebView from "@/components/customWebView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTokensWithCache } from "@/utils/getPushTokens";

import * as Linking from "expo-linking";
import { patchNotificationAllow } from "@/api/notification";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});

const GOOGLE_FORM_URL = "https://forms.gle/FsAdnW5s5LVJkmBTA";

const openInquiryPage = async () => {
  console.log("문의사항 페이지 열기 시도");
  try {
    const supported = await Linking.canOpenURL(GOOGLE_FORM_URL);
    if (supported) {
      await Linking.openURL(GOOGLE_FORM_URL);
    } else {
      Alert.alert("문의사항 페이지 열기 중 오류:", GOOGLE_FORM_URL);
    }
  } catch (error) {
    console.error("문의사항 페이지 열기 중 오류:", error);
  }
};

const OnboardingScreens = () => {
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView | null>(null);
  const { isOnboarded } = useOnboarding();
  const hasInjectedTokens = useRef(false); // 토큰 주입 여부 추적

  // 로그인 상태에 따라 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isOnboarded) {
      router.replace("/");
    }
  }, [isOnboarded]);

  // ref 설정 시 WebViewContext에 추가
  useEffect(() => {
    if (webViewRef.current && context) {
      context.addWebView(webViewRef.current);
    }
  }, [context]);

  // 웹뷰 로드 완료 시 호출될 함수
  const handleWebViewLoad = () => {
    console.log("웹뷰 로드 완료");
    injectPushTokens();
  };

  // 푸시 토큰 주입 함수
  const injectPushTokens = async () => {
    if (hasInjectedTokens.current || !webViewRef.current) return;

    try {
      // 푸시 토큰 가져오기
      const tokens = await getTokensWithCache();
      console.log("푸시 토큰 주입 준비:", tokens);

      // 웹뷰에 토큰 주입
      webViewRef.current.injectJavaScript(`
        window.pushTokenData = ${JSON.stringify(tokens)};

        // 웹 앱에 토큰 데이터 이벤트 발생
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('pushTokenReceived', {
            detail: window.pushTokenData
          }));
        }
        console.log('푸시 토큰 데이터가 주입되었습니다:', window.pushTokenData);
        true;
      `);

      hasInjectedTokens.current = true;
      console.log("푸시 토큰이 웹뷰에 주입되었습니다");
    } catch (error) {
      console.error("푸시 토큰 주입 오류:", error);
    }
  };

  // 웹뷰 메시지 처리 함수
  const handleOnboardingMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("웹뷰에서 메시지 수신 온보딩 :", data.type);

      if (data.type === "OPEN_INQUIRY_PAGE") {
        console.log("문의사항 페이지 열기 메시지 수신");
        await openInquiryPage();
      }

      if (data.type === "NOTIFICATION_SETTINGS_CHANGED") {
        console.log("알림 설정 변경 메시지 수신", data);

        const { isAllowPush, allowPushContent } = data.notificationAllow;

        console.log("알림 설정 변경 메시지 수신", isAllowPush);
        console.log("알림 설정 변경 메시지 수신", allowPushContent);

        await patchNotificationAllow({
          isAllowPush,
          allowPushContent,
        });
      }

      if (data.type === "LOG") {
        const { level = "info", message, timestamp } = data;
        const logPrefix = `[웹뷰 로그][${level}]`;
        console.log(logPrefix, message, timestamp);
      }

      if (data.type === "IMAGE_PICKER" && context) {
        // WebViewProvider의 이미지 선택 함수 호출
        await context.handleImageSelection(data.source);
      } else if (data.type === "AUTH_TOKEN" && data.data) {
        console.log("인증 토큰 수신:", data.data);

        // 토큰을 AsyncStorage에 저장
        if (data.data.accessToken) {
          await AsyncStorage.setItem("accessToken", data.data.accessToken);
        }

        if (data.data.refreshToken) {
          await AsyncStorage.setItem("refreshToken", data.data.refreshToken);
        }

        if (data.data.userData) {
          await AsyncStorage.setItem(
            "userData",
            JSON.stringify(data.data.userData),
          );
        }

        // 로그인 상태 업데이트
        await AsyncStorage.setItem("isLoggedIn", "true");
        context?.setIsLoggedIn(true);

        // 필요시 알림 표시
        console.log("로그인 성공: 토큰이 저장되었습니다.");
      } else if (data.type === "REQUEST_PUSH_TOKEN") {
        // 푸시 토큰 요청 처리
        const tokens = await getTokensWithCache();

        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PUSH_TOKEN_RESPONSE',
              data: ${JSON.stringify(tokens)}
            }));
            true;
          `);
        }
      }
    } catch (error) {
      console.error("메시지 처리 중 오류:", error);
    }
  };

  // 이미 로그인된 상태라면 렌더링하지 않음
  if (isOnboarded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <CustomWebView
        ref={webViewRef}
        source={{ uri: WEBVIEW_URL.onboarding }}
        onMessage={handleOnboardingMessage}
        onLoad={handleWebViewLoad}
      />
    </SafeAreaView>
  );
};

export default OnboardingScreens;
