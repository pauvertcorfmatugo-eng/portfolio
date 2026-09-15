import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';
import { ChatProvider } from './chat/ChatContext.jsx';
import ChatWidget from './chat/ChatWidget.jsx';

/** Remonte en haut à chaque changement de page, ou descend jusqu'à l'ancre (#projets…). */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const frame = requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'instant' });
      });
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

export default function Layout() {
  return (
    <ChatProvider>
      <ScrollManager />
      <Nav />
      <main id="contenu">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </ChatProvider>
  );
}
