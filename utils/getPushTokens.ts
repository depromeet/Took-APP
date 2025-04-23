import * as Notifications from "expo-notifications";
import registerForPushNotificationsAsync, {
  resetPushTokenCache,
} from "./registerForPushNotificationsAsync";

interface TokenData {
  fcmToken: string | null;
  expoToken: string | null;
  status?: "granted" | "denied" | "error";
  message?: string;
}

// 캐싱을 위한 변수
let cachedTokens: TokenData | null = null;

/**
 * FCM 및 Expo 푸시 토큰을 가져오는 함수
 * 캐싱을 통해 중복 호출을 방지
 */
export async function getTokensWithCache(): Promise<TokenData> {
  // 캐시된 토큰이 있으면 반환
  if (cachedTokens) {
    return cachedTokens;
  }

  try {
    // 기존 함수를 활용하여 Expo 토큰 가져오기
    const result = await registerForPushNotificationsAsync();

    // 에러 확인 및 처리
    let expoToken = null;
    let tokenStatus: "granted" | "denied" | "error" = "granted";
    let message: string | undefined = undefined;

    if (typeof result === "string") {
      // 토큰을 성공적으로 받은 경우
      expoToken = result;
    } else if (typeof result === "object") {
      // 상태 객체를 받은 경우 (권한 거부 또는 오류)
      tokenStatus = result.status;
      message = result.message;
      // 로그는 registerForPushNotificationsAsync에서 이미 출력했으므로 여기서는 생략
    }

    // FCM 토큰 가져오기 (권한이 있는 경우에만)
    let fcmToken = null;
    try {
      // 푸시 권한이 있는 경우에만 FCM 토큰 요청
      if (expoToken) {
        fcmToken = await Notifications.getDevicePushTokenAsync().then(
          (token) => token.data,
        );
      }
    } catch (error) {
      console.log("FCM 토큰을 가져오는 중 오류:", error);
    }

    // 결과 객체 생성
    const tokenData: TokenData = {
      expoToken: expoToken || null,
      fcmToken,
      status: tokenStatus,
      message,
    };

    // 캐시 저장
    cachedTokens = tokenData;

    // 로그 최소화 - 개발 환경에서 상태에 따라 출력
    if (tokenStatus === "granted") {
      console.log("푸시 토큰이 성공적으로 가져와졌습니다:", tokenData);
    }

    return tokenData;
  } catch (error) {
    console.error("푸시 토큰을 가져오는 중 오류:", error);
    return {
      fcmToken: null,
      expoToken: null,
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 캐시를 초기화하고 새로운 토큰을 가져오는 함수
 */
export async function refreshTokens(): Promise<TokenData> {
  cachedTokens = null;
  resetPushTokenCache(); // registerForPushNotificationsAsync의 캐시도 초기화
  return getTokensWithCache();
}
