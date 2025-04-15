// 환경 변수에 따른 Firebase 구성 파일과 번들 ID 선택
const ENV = process.env.APP_ENV || "development";

// 환경별 설정
const envConfig = {
  production: {
    bundleId: "com.evenway2025.took",
    packageName: "com.evenway2025.took",
    firebaseConfigFile: "./google-services.prod.json",
  },
  development: {
    bundleId: "com.evenway2025.took.dev",
    packageName: "com.evenway2025.took.dev",
    firebaseConfigFile: "./google-services.dev.json",
  },
};

const config = envConfig[ENV];

console.log(`Using ${ENV} environment with config:`, config);

export default {
  expo: {
    name: "Took",
    slug: "took",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/appIcon.png",
    scheme: "took",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: config.bundleId,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          "프로필 생성 및 수정을 하기 위해 카메라 접근이 필요합니다.",
        NSPhotoLibraryUsageDescription:
          "프로필 이미지를 선택하기 위해 사진 라이브러리 접근이 필요합니다.",
        NSMicrophoneUsageDescription:
          "카메라 사용 시 마이크 권한이 필요합니다.",
        CFBundleDevelopmentRegion: "ko",
        CFBundleLocalizations: ["ko"],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/appIcon.png",
        backgroundColor: "#ffffff",
      },
      package: config.packageName,
      googleServicesFile: config.firebaseConfigFile,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      meta: {
        viewport:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      },
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash.png",
          resizeMode: "cover",
          backgroundColor: "#ffffff",
          imageWidth: "100%",
          imageHeight: "100%",
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "프로필 생성 및 수정을 하기 위해 카메라 접근이 필요합니다.",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "프로필 이미지를 선택하기 위해 사진 라이브러리 접근이 필요합니다.",
          cameraPermission:
            "프로필 이미지를 촬영하기 위해 카메라 접근이 필요합니다.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "6380c63b-460c-43e1-a60a-3ca4f004da3d",
      },
      appEnv: ENV, // 앱 환경 변수 추가

      // 구글 OAuth 클라이언트 ID 추가
      GOOGLE_CLIENT_IOS: process.env.GOOGLE_CLIENT_IOS,
      GOOGLE_CLIENT_ANDROID: process.env.GOOGLE_CLIENT_ANDROID,
      GOOGLE_CLIENT_WEB: process.env.GOOGLE_CLIENT_WEB,
    },
    owner: "evenway2025",
  },
};
