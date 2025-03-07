import { useOnboarding } from "@/providers/OnBoardingProvider";
import { WebViewContext } from "@/providers/WebViewProvider";
import { useCallback, useContext } from "react";
import { WebViewMessageEvent } from "react-native-webview";

const useLogin = () => {
  const context = useContext(WebViewContext);
  const { completeOnboarding } = useOnboarding();

  const loadLoggedIn = useCallback(() => {
    context?.webViewRefs.current.forEach((webView) => {
      webView.injectJavaScript(`
        (function() {
            window.ReactNativeWebView.postMessage(document.cookie);
        })();
      `);
    });
  }, [context]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      console.log("Cookie- event.nativeEvent.data", event.nativeEvent.data);
      const cookieString = event.nativeEvent.data;
      const isLogged = cookieString.includes("NID_SES"); // 로그인 완료
      context?.setIsLoggedIn(cookieString.includes("NID_SES"));

      if (isLogged) {
        completeOnboarding();
      }
    },
    [context, completeOnboarding],
  );

  const logout = useCallback(() => {
    context?.webViewRefs.current.forEach((webView) => {
      webView.injectJavaScript(`
          (function() {
            document.cookie = 'NID_SES=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.naver.com';
            window.ReactNativeWebView.postMessage(document.cookie);
          })();
        `);
    });
    context?.setIsLoggedIn(false);
    if (context?.webViewRefs != null) {
      context.webViewRefs.current.forEach((webView) => {
        webView.reload();
      });
    }
  }, [context]);

  return {
    loadLoggedIn,
    onMessage,
    isLoggedIn: context?.isLoggedIn === true,
    logout,
  };
};

export default useLogin;
