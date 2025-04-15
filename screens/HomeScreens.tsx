import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { useContext, useRef, useState } from "react";
import { useBackHandler } from "@react-native-community/hooks";

import { WebViewContext } from "@/providers/WebViewProvider";
import { StyleSheet } from "react-native";
import { WEBVIEW_URL } from "@/config";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});

const HomeScreens = () => {
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView | null>(null);

  const [canGoBack, setCanGoBack] = useState(false);

  useBackHandler(() => {
    if (canGoBack && webViewRef.current != null) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <WebView
        ref={(ref) => {
          if (ref != null) {
            context?.addWebView(ref);
          }
          webViewRef.current = ref;
        }}
        showsVerticalScrollIndicator={false} // 스크롤 바 숨김
        showsHorizontalScrollIndicator={false} // 스크롤 바 숨김
        source={{ uri: WEBVIEW_URL.home }}
        style={styles.container}
        onNavigationStateChange={(event) => {
          setCanGoBack(event.canGoBack);
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreens;
