import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ChatContext = createContext(null);

/** Permet d'ouvrir le chat depuis n'importe quel bouton du site (ex. « Poser une question »). */
export function ChatProvider({ children }) {
  const [isOpen, setOpen] = useState(false);
  const [queued, setQueued] = useState(null);

  const open = useCallback((question) => {
    setOpen(true);
    if (typeof question === 'string' && question) setQueued(question);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const clearQueued = useCallback(() => setQueued(null), []);

  const value = useMemo(
    () => ({ isOpen, open, close, queued, clearQueued }),
    [isOpen, open, close, queued, clearQueued],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => useContext(ChatContext);
