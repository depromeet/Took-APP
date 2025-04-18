// app/card-notes/_layout.tsx
import { Stack } from "expo-router";

export default function CardNotesLayout() {
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
