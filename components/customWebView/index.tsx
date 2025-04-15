import { DISABLE_PINCH_ZOOM, CUSTOM_USER_AGENT } from "@/constants";
import { useBackHandler } from "@react-native-community/hooks";
import React, { useRef, useState, forwardRef, ForwardedRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

interface CustomWebViewProps {
  source: { uri: string };
  style?: StyleProp<ViewStyle>;
  onMessage?: (event: WebViewMessageEvent) => void;
}

// allowsLinkPreview={false} - iOS에서 링크 미리보기 방지
const CustomWebView = forwardRef(
  (
    { style, source, onMessage, ...props }: CustomWebViewProps,
    ref: ForwardedRef<WebView>,
  ) => {
    const internalWebViewRef = useRef<WebView | null>(null);
    const [canGoBack, setCanGoBack] = useState(false);

    useBackHandler(() => {
      if (canGoBack && internalWebViewRef.current !== null) {
        internalWebViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return (
      <WebView
        ref={ref}
        style={style}
        source={source}
        userAgent={CUSTOM_USER_AGENT}
        injectedJavaScript={DISABLE_PINCH_ZOOM}
        javaScriptEnabled={true}
        allowsLinkPreview={false}
        onMessage={onMessage || (() => {})}
        allowsBackForwardNavigationGestures // 뒤로가기 제스처 활성화
        onNavigationStateChange={(event) => {
          setCanGoBack(event.canGoBack);
        }}
        {...props}
      />
    );
  },
);

CustomWebView.displayName = "CustomWebView";

export default CustomWebView;
