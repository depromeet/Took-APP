import { API_URL } from "@/constants/api";
import { getAuthToken } from "@/utils/getAuthToken";
import { Alert } from "react-native";

// 카드 저장 함수
export const saveCardToServer = async (cardId: string) => {
  try {
    // 앱에서 사용하는 API 클라이언트나 fetch 함수 사용
    const response = await fetch(`${API_URL}/api/card/receive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (await getAuthToken()), // 인증 토큰 가져오기
      },
      body: JSON.stringify({ cardId }),
    });

    const data = await response.json();
    console.log("카드 저장 결과:", data);

    // 성공 알림 표시
    Alert.alert("알림", "명함이 저장되었습니다.");
  } catch (error) {
    console.error("카드 저장 오류:", error);
    Alert.alert("오류", "명함 저장에 실패했습니다.");
  }
};
