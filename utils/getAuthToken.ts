import AsyncStorage from "@react-native-async-storage/async-storage";

// 인증 토큰 가져오기 함수
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    console.log("토큰:", token);
    return token;
  } catch (error) {
    console.error("토큰 가져오기 오류:", error);
    return "";
  }
};
