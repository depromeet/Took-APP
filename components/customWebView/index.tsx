import { PREVENT_BOUNCE, CUSTOM_USER_AGENT } from "@/constants";
import { useBackHandler } from "@react-native-community/hooks";
import React, { useRef, useState, forwardRef, ForwardedRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  WebView,
  WebViewMessageEvent,
  WebViewProps,
} from "react-native-webview";

// WebViewProps를 확장한 인터페이스 정의
interface CustomWebViewProps extends Omit<WebViewProps, "source"> {
  source: { uri: string };
  style?: StyleProp<ViewStyle>;
  onMessage?: (event: WebViewMessageEvent) => void;
  onLoad?: () => void;
}

// allowsLinkPreview={false} - iOS에서 링크 미리보기 방지
const CustomWebView = forwardRef(
  (
    { style, source, onMessage, onLoad, ...props }: CustomWebViewProps,
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
        injectedJavaScript={PREVENT_BOUNCE}
        bounces={false} // iOS 바운스 효과 비활성화
        overScrollMode="never" // Android 오버스크롤 비활성화
        scrollEnabled={true} //
        javaScriptEnabled={true}
        allowsLinkPreview={false}
        onMessage={onMessage || (() => {})}
        onLoad={onLoad}
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
