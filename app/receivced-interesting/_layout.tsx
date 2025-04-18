// app/card-share/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function ReceivedInterestingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
