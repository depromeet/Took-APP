import { PREVENT_BOUNCE, CUSTOM_USER_AGENT } from "@/constants";
import { useBackHandler } from "@react-native-community/hooks";
import React, {
  useRef,
  useState,
  forwardRef,
  ForwardedRef,
  useEffect,
} from "react";
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

    // ref 변경 시 내부 ref 업데이트
    useEffect(() => {
      if (typeof ref !== "function" && ref?.current) {
        internalWebViewRef.current = ref.current;
      }
    }, [ref]);

    useBackHandler(() => {
      if (canGoBack && internalWebViewRef.current !== null) {
        internalWebViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return (
      <WebView
        ref={(webView) => {
          // 외부 ref 업데이트
          if (typeof ref === "function") {
            ref(webView);
          } else if (ref) {
            ref.current = webView;
          }
          // 내부 ref 업데이트
          internalWebViewRef.current = webView;
        }}
        style={style}
        source={source}
        userAgent={CUSTOM_USER_AGENT}
        injectedJavaScript={PREVENT_BOUNCE}
        bounces={false} // iOS 바운스 효과 비활성화
        overScrollMode="never" // Android 오버스크롤 비활성화
        scrollEnabled={true}
        javaScriptEnabled={true}
        allowsLinkPreview={false}
        onMessage={onMessage || (() => {})}
        onLoad={onLoad}
        allowsBackForwardNavigationGestures // 뒤로가기 제스처 활성화
        onNavigationStateChange={(event) => {
          setCanGoBack(event.canGoBack);
        }}
        geolocationEnabled={true} // 항상 위치 정보 접근 허용 - ios 에서 위치 정보 접근 허용
        {...props}
      />
    );
  },
);

CustomWebView.displayName = "CustomWebView";

export default CustomWebView;
