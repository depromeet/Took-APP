import { Alert, Linking, Platform } from "react-native";
import * as Location from "expo-location";

/**
 * 위치 권한 상태 확인 및 요청 함수
 * @returns 권한 허용 여부를 담은 Promise (true: 허용, false: 거부)
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    // 위치 권한 현재 상태 확인
    const { status: existingStatus } =
      await Location.getForegroundPermissionsAsync();

    // 이미 허용된 경우
    if (existingStatus === "granted") {
      console.log("위치 권한이 이미 허용되어 있습니다.");
      return true;
    }

    // 권한 요청
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("위치 권한이 거부되었습니다.");

      // 사용자에게 설정으로 이동할지 묻기
      Alert.alert(
        "위치 권한 필요",
        "주변 사람에게 명함을 공유하기 위해 위치 권한이 필요합니다.",
        [
          { text: "취소", style: "cancel" },
          {
            text: "설정",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ],
      );

      return false;
    }

    console.log("위치 권한이 허용되었습니다.");
    return true;
  } catch (error) {
    console.error("위치 권한 요청 중 오류 발생:", error);
    return false;
  }
};

/**
 * 위치 정보 가져오기
 *
 * 추후 웹뷰에서 위치 정보를 가져오기 위해 사용
 * @returns 위치 정보를 담은 Promise 또는 권한이 없을 경우 null
 */
export const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    return null;
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    console.error("위치 정보 가져오기 오류:", error);
    return null;
  }
};
