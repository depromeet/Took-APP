// app/card-share/_layout.tsx
import { Stack } from "expo-router";

export default function ReceivedInterestingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: "black",
        },
      }}
    />
  );
}
