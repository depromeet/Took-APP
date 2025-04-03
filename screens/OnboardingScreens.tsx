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
  const { completeOnboarding } = useOnboarding();

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "GOOGLE_LOGIN") {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          Linking.createURL("oauth2redirect"),
        );

        if (result.type === "success") {
          completeOnboarding();
          router.replace("/(tabs)");
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
