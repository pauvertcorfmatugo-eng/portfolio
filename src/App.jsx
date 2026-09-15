import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';

// Chargées seulement quand on les ouvre : la page d'accueil reste légère.
const ProjectPage = lazy(() => import('./pages/ProjectPage.jsx'));
const Espace = lazy(() => import('./pages/espace/Espace.jsx'));

const loading = (
  <div className="page-loading" aria-live="polite">
    <span className="spinner" aria-label="Chargement" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={loading}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projets/:slug" element={<ProjectPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="espace" element={<Espace />} />
      </Routes>
    </Suspense>
  );
}
