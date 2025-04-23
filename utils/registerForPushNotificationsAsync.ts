import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

// 환경에 따른 설정 가져오기
const APP_ENV = Constants.expoConfig?.extra?.appEnv ?? "development";
console.log(`[Push Notification] Current environment: ${APP_ENV}`);

// 환경에 따른 프로젝트 ID 처리
const projectId =
  APP_ENV === "production"
    ? Constants?.expoConfig?.extra?.eas?.projectId // 프로덕션 프로젝트 ID
    : Constants?.expoConfig?.extra?.eas?.projectId; // 개발 프로젝트 ID (필요 시 다른 ID 사용)

// 오류 처리 함수 - alert 제거, 에러 객체만 반환
function handleRegistrationError(errorMessage: string) {
  console.error(`[${APP_ENV}] Push registration error: ${errorMessage}`);
  return new Error(errorMessage);
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

    // 권한이 없다면 에러 객체 반환 (throw 대신)
    if (finalStatus !== "granted") {
      return {
        error: handleRegistrationError(
          "푸시 알림 권한이 없습니다. 알림 설정에서 푸시 알림 권한을 확인해주세요.",
        ),
      };
    }

    if (!projectId) {
      return {
        error: handleRegistrationError("프로젝트 ID를 찾을 수 없습니다."),
      };
    }

    try {
      console.log(
        `[${APP_ENV}] Registering for push notifications with projectId: ${projectId}`,
      );

      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log(`[${APP_ENV}] Push Token: ${pushTokenString}`);
      return pushTokenString;
    } catch (e: unknown) {
      return { error: handleRegistrationError(`FCM 토큰 등록 오류: ${e}`) };
    }
  } else {
    // 물리적 기기에서만 푸시 알림 권한 요청
    console.warn(
      "[Push Notification] Device is not physical - skipping push registration",
    );
    if (APP_ENV === "development") {
      // 개발 환경에서는 경고만 표시
      console.warn(
        "개발 환경에서는 에뮬레이터에 푸시 알림이 지원되지 않습니다.",
      );
      return "SIMULATOR_" + APP_ENV; // 시뮬레이터용 더미 토큰
    } else {
      // 프로덕션에서는 오류 객체 반환
      return {
        error: handleRegistrationError(
          "물리적 기기에서만 푸시 알림 권한을 요청할 수 있습니다.",
        ),
      };
    }
  }
}

export default registerForPushNotificationsAsync;
