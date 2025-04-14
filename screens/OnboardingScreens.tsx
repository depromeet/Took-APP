import { WEBVIEW_URL } from "../config";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { useContext, useRef, useEffect } from "react";
import { WebViewContext } from "@/providers/WebViewProvider";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useOnboarding } from "@/providers/OnBoardingProvider";
import { router } from "expo-router";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});

const OnboardingScreens = () => {
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView | null>(null);
  const { isOnboarded, handleGoogleLogin } = useOnboarding();

  // 로그인 상태에 따라 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isOnboarded) {
      router.replace("/");
    }
  }, [isOnboarded]);

  // 웹뷰 메시지 처리 함수
  const handleOnboardingMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("웹뷰에서 메시지 수신:", data.type);

      if (data.type === "GOOGLE_LOGIN") {
        console.log("구글 로그인 요청 수신");
        // 네이티브 구글 로그인 실행
        await handleGoogleLogin();
      } else if (data.type === "IMAGE_PICKER" && context) {
        // WebViewProvider의 이미지 선택 함수 호출
        await context.handleImageSelection(data.source);
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
      <WebView
        ref={(ref) => {
          if (ref != null) {
            context?.addWebView(ref);
          }
          webViewRef.current = ref;
        }}
        source={{ uri: WEBVIEW_URL.onboarding }}
        onMessage={handleOnboardingMessage}
      />
    </SafeAreaView>
  );
};

export default OnboardingScreens;
