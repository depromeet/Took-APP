import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

// 오류 처리 함수
function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

// 안드로이드에서 푸시 알림 채널 설정
async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // 물리적 기기에서만 푸시 알림 권한 요청
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 권한이 없다면 요청
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // 권한이 없다면 오류 발생
    if (finalStatus !== "granted") {
      handleRegistrationError(
        // 푸시 알림 권한이 없다면 오류 발생
        "푸시 알림 권한이 없습니다. 알림 설정에서 푸시 알림 권한을 확인해주세요.",
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("프로젝트 ID를 찾을 수 없습니다.");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    // 물리적 기기에서만 푸시 알림 권한 요청
    handleRegistrationError(
      "물리적 기기에서만 푸시 알림 권한을 요청할 수 있습니다.",
    );
  }
}

export default registerForPushNotificationsAsync;
