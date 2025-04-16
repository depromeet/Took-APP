// app/card-share/_layout.tsx
import { Stack } from "expo-router";

export default function CardDetailLayout() {
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
