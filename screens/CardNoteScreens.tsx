import { SafeAreaView } from "react-native-safe-area-context";
import CustomWebView from "@/components/customWebView";
import { StyleSheet } from "react-native";
import { useContext, useRef } from "react";
import WebView from "react-native-webview";
import { WebViewContext } from "@/providers/WebViewProvider";
import { WEBVIEW_URL } from "@/config";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});

const CardNoteScreens = () => {
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView | null>(null);

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
        source={{ uri: WEBVIEW_URL.cardNotes }}
        style={styles.container}
      />
    </SafeAreaView>
  );
};

export default CardNoteScreens;
