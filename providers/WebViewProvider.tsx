import {
  MutableRefObject,
  ReactNode,
  createContext,
  useCallback,
  useRef,
  useState,
} from "react";
import WebView from "react-native-webview";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

interface WebViewContexType {
  webViewRefs: MutableRefObject<WebView[]>;
  addWebView: (webView: WebView) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  handleImageSelection: (source: "camera" | "library") => Promise<void>;
  handleMessage: (event: any) => Promise<void>;
}

const WebViewContext = createContext<WebViewContexType | undefined>(undefined);

const WebViewProvider = ({ children }: { children: ReactNode }) => {
  const webViewRefs = useRef<WebView[]>([]);

  const addWebView = useCallback((webView: WebView) => {
    webViewRefs.current.push(webView);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 이미지 URI를 base64로 변환하는 함수
  const uriToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("URI를 base64로 변환 중 오류:", error);
      throw error;
    }
  };

  // 이미지 선택 처리 함수
  const handleImageSelection = async (source: "camera" | "library") => {
    try {
      let result;

      // 카메라 또는 갤러리에서 이미지 선택
      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("권한 필요", "카메라 접근 권한이 필요합니다.");
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        // URI를 base64로 변환
        const base64Image = await uriToBase64(uri);

        // base64 이미지를 웹뷰로 전송
        webViewRefs.current.forEach((webView) => {
          webView.injectJavaScript(`
            (function() {
              window.postMessage('${base64Image}');
            })();
            true;
          `);
        });
      }
    } catch (error) {
      console.error("이미지 선택 중 오류:", error);
      Alert.alert("오류", "이미지를 선택하는 중 문제가 발생했습니다.");
    }
  };

  // 웹뷰로부터 메시지 수신 처리
  const handleMessage = async (event: any) => {
    try {
      if (typeof event.nativeEvent.data === "string") {
        if (event.nativeEvent.data.startsWith("{")) {
          const data = JSON.parse(event.nativeEvent.data);

          if (data.type === "IMAGE_PICKER") {
            await handleImageSelection(data.source);
          } else if (data.type === "GOOGLE_LOGIN") {
            // 기존 로그인 처리 로직이 있다면 호출
            // 현재 이 로직은 OnboardingScreens.tsx에 있음
          }
        } else {
          // 기존 쿠키 처리 등 다른 로직이 있다면 여기서 처리
          console.log("WebView 메시지:", event.nativeEvent.data);
        }
      }
    } catch (error) {
      console.error("메시지 처리 중 오류:", error);
    }
  };

  return (
    <WebViewContext.Provider
      value={{
        webViewRefs,
        addWebView,
        isLoggedIn,
        setIsLoggedIn,
        handleImageSelection,
        handleMessage,
      }}
    >
      {children}
    </WebViewContext.Provider>
  );
};

export { WebViewProvider, WebViewContext };
