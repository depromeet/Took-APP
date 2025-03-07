import { StyleSheet } from "react-native";
import CustomWebView from "@/components/customWebView";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnBoardingView() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomWebView
        source={{ uri: "https://local.took.com:2222/card-create" }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
