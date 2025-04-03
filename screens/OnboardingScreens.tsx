import { WEBVIEW_URL } from "../config";
import WebView from "react-native-webview";
import { useContext, useRef } from "react";
import { WebViewContext } from "@/providers/WebViewProvider";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useOnboarding } from "@/providers/OnBoardingProvider";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});

const OnboardingScreens = () => {
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView | null>(null);
  const { completeOnboarding } = useOnboarding();

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "GOOGLE_LOGIN") {
        console.log("Opening auth session with URL:", data.url);
        const redirectUrl = Linking.createURL("oauth2redirect");

        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
        );

        console.log("result", JSON.stringify(result, null, 2));

        if (result.type === "success") {
          // 성공 시 웹브라우저는 자동으로 닫히고 앱으로 돌아옴
          console.log("성공");

          completeOnboarding();
          Linking.openURL("took://");
        } else if (result.type === "cancel") {
          alert("로그인이 취소되었습니다. 다시 시도해주세요.");
        }
      }
    } catch (error) {
      console.error("메시지 처리 중 오류:", error);
    }
  };

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
        onMessage={handleMessage}
      />
    </SafeAreaView>
  );
};

export default OnboardingScreens;
