import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY } from "@/config";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

import Constants from "expo-constants";

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

  // TODO: 암호화
  // Google Auth 설정
  const [_, response, promptAsync] = Google.useAuthRequest({
    iosClientId:
      "890765471785-gli6ulvs6s580qcso9ldlsvjjf5vdlko.apps.googleusercontent.com",
    androidClientId:
      "890765471785-8s3nde991cotb5qhldrlbbni0uvuedba.apps.googleusercontent.com",
    webClientId:
      "890765471785-afsh8orctuebf8u7ldioe3eeksglei1s.apps.googleusercontent.com",
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

    // Google 로그인 응답 처리
    if (response?.type === "success") {
      console.log("Google 로그인 성공:", response);
      completeOnboarding();
    }
  }, [completeOnboarding, response]);

  const handleGoogleLogin = async () => {
    console.log("Google 로그인 시도");
    try {
      const result = await promptAsync();
      console.log("프롬프트 결과:", result);

      if (result.type === "success") {
        // completeOnboarding은 useEffect에서 response 변화를 감지하여 처리됨
        console.log("로그인 성공");
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
