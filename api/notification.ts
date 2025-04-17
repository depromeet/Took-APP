import { ApiResponseType } from "@/types";
import { API_URL } from "@/constants/api";
import { getAuthToken } from "@/utils/getAuthToken";
import { Alert } from "react-native";

type NotificationType = "INTERESTING" | "MEMO" | "SYSTEM";

export interface NotificationAllowPayload {
  isAllowPush: boolean;
  allowPushContent: NotificationType[];
}

/**
 * 알림 설정을 서버에 저장하는 함수
 * @param payload 알림 설정 정보
 * @returns
 */
export const patchNotificationAllow = async (
  payload: NotificationAllowPayload,
): Promise<ApiResponseType<any>> => {
  try {
    const response = await fetch(`${API_URL}/api/user/notification-allow`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (await getAuthToken()), // 인증 토큰 가져오기
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("알림 설정 저장 결과:", data);

    return data;
  } catch (error) {
    console.error("알림 설정 저장 오류:", error);
    Alert.alert("오류", "알림 설정 저장에 실패했습니다.");
    throw error;
  }
};
