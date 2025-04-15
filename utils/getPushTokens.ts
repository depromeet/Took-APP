import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

async function getPushTokens() {
  // FCM 네이티브 토큰
  const deviceToken = await Notifications.getDevicePushTokenAsync();
  console.log("FCM 토큰:", deviceToken.data);

  // Expo 토큰
  const expoToken = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  console.log("Expo 토큰:", expoToken.data);

  return { fcmToken: deviceToken.data, expoToken: expoToken.data };
}

export default getPushTokens;
