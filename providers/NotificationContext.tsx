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

const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<EventSubscription>();
  const responseListener = useRef<EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => setExpoPushToken(token ?? null),
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
      Notifications.addNotificationResponseReceivedListener((notification) => {
        console.log(
          "notification response",
          JSON.stringify(notification, null, 2),
          JSON.stringify(
            notification.notification.request.content.data,
            null,
            2,
          ),
        );
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
