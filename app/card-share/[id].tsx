import CardShareScreens from "@/screens/CardShareScreens";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useDeepLink } from "@/providers/DeepLinkProvider";

export default function CardShareDetailView() {
  const { id } = useLocalSearchParams();
  const { setCardId } = useDeepLink();

  // 경로 매개변수에서 ID를 가져와 Context에 설정
  useEffect(() => {
    if (id) {
      setCardId(String(id));
    }
  }, [id, setCardId]);

  return <CardShareScreens />;
}
