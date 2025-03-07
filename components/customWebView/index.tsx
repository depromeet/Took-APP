import { useBackHandler } from "@react-native-community/hooks";
import React, { useRef, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

interface CustomWebViewProps {
  source: { uri: string };
  style?: StyleProp<ViewStyle>;
}

const DISABLE_PINCH_ZOOM = `(function() {
    const meta = document.createElement('meta');
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    meta.setAttribute('name', 'viewport');
    document.getElementsByTagName('head')[0].appendChild(meta);

    document.body.style['user-select'] = 'none'; // 안드로이드 방지 - 텍스트 롱 프레스
    document.body.style['-webkit-user-select'] = 'none'; // ios 방지 - 텍스트 롱 프레스
  })();`;

// allowsLinkPreview={false} - iOS에서 링크 미리보기 방지
const CustomWebView = ({ style, source, ...props }: CustomWebViewProps) => {
  const webViewRef = useRef<WebView | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useBackHandler(() => {
    if (canGoBack && webViewRef.current !== null) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  });

  return (
    <WebView
      style={style}
      source={source}
      injectedJavaScript={DISABLE_PINCH_ZOOM}
      javaScriptEnabled={true}
      allowsLinkPreview={false}
      onMessage={() => {}}
      onNavigationStateChange={(event) => {
        setCanGoBack(event.canGoBack);
      }}
      {...props}
    />
  );
};

export default CustomWebView;
