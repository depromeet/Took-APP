import registerForPushNotificationsAsync from "./registerForPushNotificationsAsync";

interface TokenData {
  expoToken: string | null;
}

// 캐싱을 위한 변수
let cachedTokens: TokenData | null = null;

/**
 * 캐싱을 통해 중복 호출을 방지
 * Expo 푸시 토큰을 가져오는 함수
 */
export async function getTokensWithCache(): Promise<TokenData> {
  // 캐시된 토큰이 있으면 반환
  if (cachedTokens) {
    return cachedTokens;
  }

  try {
    // 기존 함수를 활용하여 Expo 토큰 가져오기
    const result = await registerForPushNotificationsAsync();

    console.log("result", result);

    // 에러 확인 및 처리 (에러 객체가 반환된 경우 처리)
    const expoToken =
      result && typeof result === "object" && "error" in result ? null : result;

    // 토큰 캐싱
    cachedTokens = {
      expoToken: expoToken ?? null,
    };

    console.log("푸시 토큰이 성공적으로 가져와졌습니다:", cachedTokens);
    return cachedTokens;
  } catch (error) {
    console.error("푸시 토큰을 가져오는 중 오류 발생:", error);
    return { expoToken: null };
  }
}

/**
 * 캐시를 초기화하고 새로운 토큰을 가져오는 함수
 */
export async function refreshTokens(): Promise<TokenData> {
  cachedTokens = null;
  return getTokensWithCache();
}
