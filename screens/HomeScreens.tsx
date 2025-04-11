import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { useContext, useRef, useState } from "react";
import { useBackHandler } from "@react-native-community/hooks";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system";

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
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            (function() {
              window.postMessage('${base64Image}');
            })();
            true;
          `);
        }
      }
    } catch (error) {
      console.error("이미지 선택 중 오류:", error);
      Alert.alert("오류", "이미지를 선택하는 중 문제가 발생했습니다.");
    }
  };

  // 웹뷰로부터 메시지 수신 처리
  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "IMAGE_PICKER") {
        await handleImageSelection(data.source);
      }
    } catch (error) {
      console.error("메시지 처리 중 오류:", error);
    }
  };

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
        onMessage={handleMessage}
        onNavigationStateChange={(event) => {
          setCanGoBack(event.canGoBack);
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreens;
