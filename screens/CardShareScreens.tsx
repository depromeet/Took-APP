import { SafeAreaView } from "react-native-safe-area-context";
import CustomWebView from "@/components/customWebView";
import { StyleSheet } from "react-native";
import { useContext, useRef, useEffect } from "react";
import WebView from "react-native-webview";
import { WebViewContext } from "@/providers/WebViewProvider";
import { WEBVIEW_URL } from "@/config";
import { useLocalSearchParams } from "expo-router";
import { useDeepLink } from "@/providers/DeepLinkProvider";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  statusBar: {
    backgroundColor: "#000",
  },
});

const CardShareScreens = () => {
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView | null>(null);
  const { cardId: routerCardId } = useLocalSearchParams();
  const { cardId: deepLinkCardId, setCardId } = useDeepLink();

  // Context나 라우터 파라미터에서 cardId 가져오기
  const cardId = deepLinkCardId || routerCardId;

  // 컴포넌트 언마운트 시 cardId 초기화
  useEffect(() => {
    return () => {
      if (deepLinkCardId) {
        setCardId(null);
      }
    };
  }, [deepLinkCardId, setCardId]);

  // URL 구성 (cardId가 있으면 추가)
  const webviewUrl = cardId
    ? `${WEBVIEW_URL.cardShare}/${cardId}`
    : WEBVIEW_URL.cardShare;

  console.log("카드 공유 화면 URL:", webviewUrl);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <CustomWebView
        ref={(ref) => {
          if (ref != null) {
            context?.addWebView(ref);
          }
          webViewRef.current = ref;
        }}
        source={{ uri: webviewUrl }}
        style={styles.container}
      />
    </SafeAreaView>
  );
};

export default CardShareScreens;
