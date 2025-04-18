import * as Notifications from "expo-notifications";
import registerForPushNotificationsAsync from "./registerForPushNotificationsAsync";

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
    const expoToken = await registerForPushNotificationsAsync();

    // FCM 토큰 가져오기 (권한 문제는 이미 registerForPushNotificationsAsync에서 처리됨)
    let fcmToken = null;
    try {
      fcmToken = await Notifications.getDevicePushTokenAsync().then(
        (token) => token.data,
      );
    } catch (error) {
      console.log("FCM 토큰을 가져오는 중 오류 발생:", error);
    }

    // 토큰 캐싱
    cachedTokens = {
      expoToken: expoToken || null,
      fcmToken,
    };

    console.log("푸시 토큰이 성공적으로 가져와졌습니다:", cachedTokens);
    return cachedTokens;
  } catch (error) {
    console.error("푸시 토큰을 가져오는 중 오류 발생:", error);
    return { fcmToken: null, expoToken: null };
  }
}

/**
 * 캐시를 초기화하고 새로운 토큰을 가져오는 함수
 */
export async function refreshTokens(): Promise<TokenData> {
  cachedTokens = null;
  return getTokensWithCache();
}
