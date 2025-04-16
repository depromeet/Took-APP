import React from "react";
import { Stack, router } from "expo-router";
import { useBackHandler } from "@react-native-community/hooks";
import CardShareDetailScreens from "../../screens/CardShareDetailScreens";

export default function CardDetailScreen() {
  // 하드웨어 뒤로가기 버튼 처리 (안드로이드)
  useBackHandler(() => {
    // 뒤로가기 시 홈으로 이동
    router.replace("/");
    return true; // 이벤트 전파 중지
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: "명함 상세",
          headerShown: false,
        }}
      />
      <CardShareDetailScreens />
    </>
  );
}
