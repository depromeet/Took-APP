import { SafeAreaView } from "react-native-safe-area-context";
import { WebViewContext } from "../providers/WebViewProvider";
import { StyleSheet } from "react-native";
import CustomWebView from "../components/customWebView";
import { useContext, useRef } from "react";
import WebView from "react-native-webview";
import { WEBVIEW_URL } from "../config";
import { useLocalSearchParams, router } from "expo-router";
import { useBackHandler } from "@react-native-community/hooks";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});

const ReceivedInterestingScreens = () => {
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView | null>(null);
  const params = useLocalSearchParams();
  const isDeepLink = params.deepLink === "true";

  // 딥링크로 진입한 경우 하드웨어 뒤로가기 버튼 처리
  useBackHandler(() => {
    if (isDeepLink) {
      console.log("뒤로가기 버튼 감지: 홈 화면으로 이동");
      // 홈 화면으로 리디렉션
      router.replace("/(auth)" as any);
      return true; // 이벤트 처리 완료
    }
    return false;
  });

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      <CustomWebView
        ref={(ref) => {
          if (ref != null) {
            context?.addWebView(ref);
          }
          webViewRef.current = ref;
        }}
        source={{ uri: WEBVIEW_URL.receivedInteresting }}
        style={styles.container}
      />
    </SafeAreaView>
  );
};

export default ReceivedInterestingScreens;
