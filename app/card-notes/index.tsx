import CardNoteScreens from "@/screens/CardNoteScreens";
import { StyleSheet } from "react-native";
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

const CardNotes = () => {
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <CardNoteScreens />
    </SafeAreaView>
  );
};

export default CardNotes;
