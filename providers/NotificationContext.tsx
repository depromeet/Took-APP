import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-modules-core";
import * as Linking from "expo-linking";
import registerForPushNotificationsAsync from "@/utils/registerForPushNotificationsAsync";
import { Alert } from "react-native";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  permissionStatus: "granted" | "denied" | "error" | "unknown";
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "NotificationProvider 내에서 useNotification을 사용해야 합니다.",
    );
  }
  return context;
};

/**
 * 알림 데이터에서 링크를 추출하고 해당 링크로 이동하는 함수
 * @param data 알림 데이터
 */
const handleNotificationLink = (data: any) => {
  try {
    if (data?.link) {
      // 앱 내부 경로인 경우
      if (data.link.startsWith("/")) {
        const url = Linking.createURL(
          data.link.startsWith("/") ? data.link.substring(1) : data.link,
        );
        console.log("Linking URL:", url);
        Linking.openURL(url);
      }
      // 외부 URL인 경우 (http://, https:// 등)
      else if (data.link.startsWith("http")) {
        Linking.openURL(data.link);
      }
    }
  } catch (error) {
    console.error("딥링크 처리 오류:", error);
  }
};

const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "error" | "unknown"
  >("unknown");
  const [alertShown, setAlertShown] = useState(false); // 알림이 이미 표시되었는지 추적

  const notificationListener = useRef<EventSubscription>();
  const responseListener = useRef<EventSubscription>();

  useEffect(() => {
    // 푸시 토큰 가져오기
    registerForPushNotificationsAsync().then(
      (result) => {
        // 응답 처리
        if (typeof result === "string") {
          // 토큰을 성공적으로 받은 경우
          console.log("토큰 등록 성공:", result);
          setExpoPushToken(result);
          setPermissionStatus("granted");
          setError(null);
        } else if (typeof result === "object") {
          // 권한 상태 또는 오류 객체인 경우
          if (result.status === "denied") {
            // 권한 거부 상태 - 정상적인 상태로 처리
            setPermissionStatus("denied");
            setExpoPushToken(null);

            // 처음 한 번만 알림 표시
            if (!alertShown) {
              setAlertShown(true);
              Alert.alert("알림 권한", result.message);
            }
          } else if (result.status === "error") {
            // 실제 오류 상태
            setPermissionStatus("error");
            setError(new Error(result.message));
            setExpoPushToken(null);

            // 처음 한 번만 알림 표시
            if (!alertShown) {
              setAlertShown(true);
              Alert.alert("알림 오류", result.message);
            }
          }
        }
      },
      (err) => {
        // 예외가 발생한 경우
        console.error("토큰 요청 중 예외 발생:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setPermissionStatus("error");
        setExpoPushToken(null);

        // 알림은 한 번만 표시
        if (!alertShown) {
          setAlertShown(true);
          Alert.alert("알림 오류", "푸시 알림 설정 중 오류가 발생했습니다.");
        }
      },
    );

    // 푸시 알림 수신 시 실행
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "notification received",
          JSON.stringify(notification, null, 2),
          JSON.stringify(notification.request.content.data, null, 2),
        );
        setNotification(notification);
      });

    // 푸시 알림 클릭 시 실행
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("notification response", JSON.stringify(data, null, 2));

        // 알림에 포함된 링크로 이동
        handleNotificationLink(data);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }

      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [alertShown]);

  const notificationContextValue = useMemo(
    () => ({
      expoPushToken,
      notification,
      error,
      permissionStatus,
    }),
    [expoPushToken, notification, error, permissionStatus],
  );

  return (
    <NotificationContext.Provider value={notificationContextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
