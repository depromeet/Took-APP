import React from "react";
import { Slot } from "expo-router";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  statusBar: {
    backgroundColor: "#000",
  },
});

export default function AuthLayout() {
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar
        style="light"
        backgroundColor={styles.statusBar.backgroundColor}
      />
      <Slot />
    </SafeAreaView>
  );
}
