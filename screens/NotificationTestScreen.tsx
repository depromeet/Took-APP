import { SafeAreaView } from "react-native-safe-area-context";
import { useNotification } from "../providers/NotificationContext";
import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

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
      <View>
        <Text>expoPushToken: {expoPushToken}</Text>
        <Text>notification: {JSON.stringify(notification)}</Text>
        <Text>error: {JSON.stringify(error)}</Text>
      </View>
    </SafeAreaView>
  );
}
