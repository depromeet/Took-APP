import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY } from "@/config";

interface OnboardingContextType {
  isOnboarded: boolean;
  completeOnboarding: () => void;
}

const onboardingInitialState: OnboardingContextType = {
  isOnboarded: false,
  completeOnboarding: () => {},
};

const OnboardingContext = createContext<OnboardingContextType>(
  onboardingInitialState,
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY.isLoggedIn).then((value) => {
      if (value === "true") setIsOnboarded(true);
    });
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_KEY.isLoggedIn, "true");
    setIsOnboarded(true);
  };

  return (
    <OnboardingContext.Provider value={{ isOnboarded, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
