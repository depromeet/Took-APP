import { SafeAreaView } from "react-native-safe-area-context";
import { useNotification } from "../providers/NotificationContext";
import { View, Text, StyleSheet, Button } from "react-native";
import * as Notifications from "expo-notifications";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

async function schedulePushNotification(data: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "테스트 알림",
      body: data,
    },
    trigger: null,
  });
}

export default function NotificationTestScreen() {
  const { expoPushToken, notification, error } = useNotification();

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  console.log("expoPushToken", expoPushToken);
  console.log("notification", notification);
  console.log("error", error);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          expoPushToken: {expoPushToken}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          notification: {JSON.stringify(notification)}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          error: {JSON.stringify(error)}
        </Text>
      </View>

      <Button
        title="test"
        onPress={() => schedulePushNotification("윤장원입니다.")}
      />
    </SafeAreaView>
  );
}
