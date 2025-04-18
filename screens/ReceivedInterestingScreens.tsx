import { SafeAreaView } from "react-native-safe-area-context";
import { WebViewContext } from "@/providers/WebViewProvider";
import { StyleSheet } from "react-native";
import CustomWebView from "@/components/customWebView";
import { useContext, useRef } from "react";
import WebView from "react-native-webview";
import { WEBVIEW_URL } from "@/config";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const ReceivedInterestingScreens = () => {
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
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
