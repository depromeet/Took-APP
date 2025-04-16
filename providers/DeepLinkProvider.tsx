// /providers/DeepLinkProvider.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

interface DeepLinkContextType {
  cardId: string | null;
  setCardId: (id: string | null) => void;
}

const DeepLinkContext = createContext<DeepLinkContextType>({
  cardId: null,
  setCardId: () => {},
});

export const useDeepLink = () => useContext(DeepLinkContext);

export const DeepLinkProvider = ({ children }: { children: ReactNode }) => {
  const [cardId, setCardId] = useState<string | null>(null);

  return (
    <DeepLinkContext.Provider value={{ cardId, setCardId }}>
      {children}
    </DeepLinkContext.Provider>
  );
};
