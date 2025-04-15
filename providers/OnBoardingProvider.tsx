import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY } from "@/config";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

// 브라우저 세션 자동 완료 설정
WebBrowser.maybeCompleteAuthSession();

interface OnboardingContextType {
  isOnboarded: boolean;
  completeOnboarding: () => void;
}

interface OnboardingProviderProps {
  readonly children: React.ReactNode;
}

const onboardingInitialState: OnboardingContextType = {
  isOnboarded: false,
  completeOnboarding: () => {},
};

const OnboardingContext = createContext<OnboardingContextType>(
  onboardingInitialState,
);

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isOnboarded, setIsOnboarded] = useState(false);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY.isLoggedIn, "true");
    setIsOnboarded(true);

    // 로그인 성공 시 라우팅
    if (isOnboarded) {
      router.replace("/");
    }
  }, [isOnboarded]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY.isLoggedIn).then((value) => {
      if (value === "true") setIsOnboarded(true);
    });
  }, [completeOnboarding]);

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarded,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
