import { SafeAreaView } from "react-native-safe-area-context";
import CustomWebView from "@/components/customWebView";
import { StyleSheet } from "react-native";
import { useContext, useRef } from "react";
import WebView from "react-native-webview";
import { WebViewContext } from "@/providers/WebViewProvider";
import { WEBVIEW_URL } from "@/config";
import { useLocalSearchParams, router } from "expo-router";
import { useDeepLink } from "@/providers/DeepLinkProvider";
import { StatusBar } from "expo-status-bar";
import { useBackHandler } from "@react-native-community/hooks";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});

const CardShareDetailScreens = () => {
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView | null>(null);
  const { cardId: routerCardId } = useLocalSearchParams();
  const { cardId: deepLinkCardId } = useDeepLink();

  // Context나 라우터 파라미터에서 cardId 가져오기
  const cardId = deepLinkCardId || routerCardId;

  // 웹뷰에서 뒤로가기 처리를 위한 상태
  const canGoBackRef = useRef(false);

  // 뒤로가기 핸들러
  useBackHandler(() => {
    // 웹뷰에서 뒤로가기가 가능하면 웹뷰 내에서 뒤로가기
    if (webViewRef.current && canGoBackRef.current) {
      webViewRef.current.goBack();
      return true;
    }

    // 그렇지 않으면 앱의 홈 화면으로 이동
    router.replace("/");
    return true;
  });

  // URL 구성 (cardId와 함께 기본 타입 receivedcard 사용)
  const webviewUrl = cardId
    ? `${WEBVIEW_URL.cardShareDetail}/${cardId}?type=receivedcard`
    : WEBVIEW_URL.cardShareDetail;

  console.log("카드 상세 화면 URL:", webviewUrl);

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      {/* 상태바 스타일 설정 */}
      <StatusBar style="light" backgroundColor="#000000" />

      <CustomWebView
        ref={(ref) => {
          if (ref != null) {
            context?.addWebView(ref);

            // WebView 인스턴스 참조 저장
            webViewRef.current = ref;

            // 웹뷰 로드 완료 후 뒤로가기 가능 여부 확인
            if (ref.injectJavaScript) {
              ref.injectJavaScript(`
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'navigationState',
                  canGoBack: window.history.length > 1
                }));
                true;
              `);
            }
          }
        }}
        source={{ uri: webviewUrl }}
        style={styles.container}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "navigationState") {
              canGoBackRef.current = data.canGoBack;
            }
          } catch (e) {
            console.error("웹뷰 메시지 파싱 오류:", e);
          }
        }}
      />
    </SafeAreaView>
  );
};

export default CardShareDetailScreens;
