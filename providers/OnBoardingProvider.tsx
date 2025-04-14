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
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";

import Constants from "expo-constants";
import { CLIENT_DEV_IDS, CLIENT_IDS } from "@/constants/client";

const ENV = process.env.APP_ENV || "development";

// 브라우저 세션 자동 완료 설정
WebBrowser.maybeCompleteAuthSession();

interface OnboardingContextType {
  isOnboarded: boolean;
  completeOnboarding: () => void;
  handleGoogleLogin: () => Promise<void>;
}

const onboardingInitialState: OnboardingContextType = {
  isOnboarded: false,
  completeOnboarding: () => {},
  handleGoogleLogin: async () => {},
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

  const iosClientId =
    Constants.expoConfig?.extra?.GOOGLE_CLIENT_IOS || ENV === "development"
      ? CLIENT_DEV_IDS.ios
      : CLIENT_IDS.ios;
  const androidClientId =
    Constants.expoConfig?.extra?.GOOGLE_CLIENT_ANDROID ||
    (ENV === "development" ? CLIENT_DEV_IDS.android : CLIENT_IDS.android);
  const webClientId =
    Constants.expoConfig?.extra?.GOOGLE_CLIENT_WEB ||
    (ENV === "development" ? CLIENT_DEV_IDS.web : CLIENT_IDS.web);

  // Google Auth 설정
  const [_, response, promptAsync] = Google.useAuthRequest({
    iosClientId,
    androidClientId,
    webClientId,
    redirectUri: makeRedirectUri({
      scheme: "took",
      path: "oauth2redirect/google",
    }),
  });

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
  }, [completeOnboarding, response]);

  const handleGoogleLogin = async () => {
    console.log("Google 로그인 시도");
    try {
      const result = await promptAsync();
      console.log("프롬프트 결과:", result);

      if (result.type === "success") {
        console.log("로그인 성공");
        completeOnboarding();
      } else {
        console.log("로그인 취소 또는 실패:", result.type);
      }
    } catch (error) {
      console.error("Google 로그인 오류:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarded,
        completeOnboarding,
        handleGoogleLogin,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
