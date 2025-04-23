import * as Notifications from "expo-notifications";
import registerForPushNotificationsAsync, {
  resetPushTokenCache,
} from "./registerForPushNotificationsAsync";

interface TokenData {
  fcmToken: string | null;
  expoToken: string | null;
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

    // 에러 확인 및 처리 (에러 객체가 반환된 경우 처리)
    let expoToken = null;
    if (result && typeof result === "object" && "error" in result) {
      console.log("Expo 토큰 가져오는 중 오류:", result.error);
    } else {
      expoToken = result;
    }

    // FCM 토큰 가져오기 (권한 문제는 이미 registerForPushNotificationsAsync에서 처리됨)
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

    // 토큰 캐싱
    cachedTokens = {
      expoToken: expoToken ?? null,
      fcmToken,
    };

    // 로그 최소화 - 권한이 있을 때만 성공 로그 출력
    if (expoToken) {
      console.log("푸시 토큰이 성공적으로 가져와졌습니다:", cachedTokens);
    }

    return cachedTokens;
  } catch (error) {
    console.error("푸시 토큰을 가져오는 중 오류:", error);
    return { fcmToken: null, expoToken: null };
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
