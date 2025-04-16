import { WEBVIEW_URL } from "../config";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { useContext, useRef, useEffect } from "react";
import { WebViewContext } from "@/providers/WebViewProvider";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useOnboarding } from "@/providers/OnBoardingProvider";
import { router } from "expo-router";
import CustomWebView from "@/components/customWebView";
import AsyncStorage from "@react-native-async-storage/async-storage";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});

const OnboardingScreens = () => {
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView | null>(null);
  const { isOnboarded } = useOnboarding();

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

  // 웹뷰 메시지 처리 함수
  const handleOnboardingMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("웹뷰에서 메시지 수신 온보딩 :", data.type);
      console.log("웹뷰에서 메시지 수신 온보딩 :", data.data);

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
      />
    </SafeAreaView>
  );
};

export default OnboardingScreens;
