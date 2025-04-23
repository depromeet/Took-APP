import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

// 환경에 따른 설정 가져오기
const APP_ENV = Constants.expoConfig?.extra?.appEnv || "development";
console.log(`[Push Notification] Current environment: ${APP_ENV}`);

// 결과 타입 정의
type PushTokenResult = string | { status: "denied" | "error"; message: string };

// 오류 로깅 중복 방지를 위한 변수
let errorLogged = false;
let cachedResult: PushTokenResult | null = null;

/**
 * 알림 권한이 없는 경우를 처리하는 함수
 * 오류가 아닌 상태로 처리합니다
 */
function handlePermissionDenied(message: string): {
  status: "denied";
  message: string;
} {
  // 개발 환경에서만 콘솔에 정보 메시지 출력
  if (APP_ENV === "development" && !errorLogged) {
    console.log(`[${APP_ENV}] 알림 권한 상태: ${message}`);
    errorLogged = true;
  }
  return { status: "denied", message };
}

/**
 * 실제 오류 상황을 처리하는 함수
 */
function handleRegistrationError(errorMessage: string): {
  status: "error";
  message: string;
} {
  // 개발 환경에서만 콘솔에 오류 메시지 출력
  if (APP_ENV === "development" && !errorLogged) {
    console.error(`[${APP_ENV}] Push registration error: ${errorMessage}`);
    errorLogged = true;
  }
  return { status: "error", message: errorMessage };
}

// 안드로이드에서 푸시 알림 채널 설정
async function registerForPushNotificationsAsync(): Promise<PushTokenResult> {
  // 캐시된 결과가 있으면 바로 반환
  if (cachedResult) {
    return cachedResult;
  }

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

    // 권한이 없다면 권한 거부 상태 반환 (오류가 아님)
    if (finalStatus !== "granted") {
      cachedResult = handlePermissionDenied(
        "푸시 알림 권한이 없습니다. 알림 설정에서 푸시 알림 권한을 확인해주세요.",
      );
      return cachedResult;
    }

    // 환경에 따른 프로젝트 ID 처리
    const projectId =
      APP_ENV === "production"
        ? Constants?.expoConfig?.extra?.eas?.projectId // 프로덕션 프로젝트 ID
        : Constants?.expoConfig?.extra?.eas?.projectId; // 개발 프로젝트 ID (필요 시 다른 ID 사용)

    if (!projectId) {
      cachedResult = handleRegistrationError("프로젝트 ID를 찾을 수 없습니다.");
      return cachedResult;
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
      cachedResult = pushTokenString;
      return pushTokenString;
    } catch (e: unknown) {
      console.error("FCM 토큰 등록 중 오류:", e);
      cachedResult = handleRegistrationError(`FCM 토큰 등록 오류: ${e}`);
      return cachedResult;
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
      cachedResult = "SIMULATOR_" + APP_ENV; // 시뮬레이터용 더미 토큰
      return cachedResult;
    } else {
      // 프로덕션에서는 오류 객체 반환
      cachedResult = handleRegistrationError(
        "물리적 기기에서만 푸시 알림 권한을 요청할 수 있습니다.",
      );
      return cachedResult;
    }
  }
}

// 토큰 새로고침을 위한 함수 추가
export function resetPushTokenCache() {
  cachedResult = null;
  errorLogged = false;
}

export default registerForPushNotificationsAsync;
