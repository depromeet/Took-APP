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

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
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

  const notificationListener = useRef<EventSubscription>();
  const responseListener = useRef<EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => {
        console.log("token", token);
        setExpoPushToken(token ?? null);
      },
      (error) => setError(error),
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
  }, []);

  const notificationContextValue = useMemo(
    () => ({ expoPushToken, notification, error }),
    [expoPushToken, notification, error],
  );

  return (
    <NotificationContext.Provider value={notificationContextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
