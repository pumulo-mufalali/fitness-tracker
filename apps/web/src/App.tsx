import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from "./providers/auth-provider";
import DashboardLayout from "./components/DashboardLayout";
import AuthPage from "./pages/AuthPage";
import ExercisesPage from "./pages/ExercisesPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import { getUserPreferences, saveUserPreferences, logUserActivity } from "./lib/firebase-user-preferences-service";

type PageType = 'dashboard' | 'profile' | 'goals' | 'achievements' | 'exercises' | 'workouts' | 'schedule' | 'settings';

const LOCKED_PAGES: PageType[] = ['profile', 'goals', 'achievements', 'workouts', 'schedule'];
const ALL_PAGES: PageType[] = ['dashboard', 'profile', 'goals', 'achievements', 'workouts', 'schedule', 'settings'];

function DashboardApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences', user?.uid],
    queryFn: () => getUserPreferences(user!.uid),
    enabled: !!user?.uid,
  });

  const justLoggedIn = useRef(sessionStorage.getItem('myfitness_just_logged_in') === 'true');

  const [activePage, setActivePage] = useState<PageType>(() => {
    if (justLoggedIn.current) {
      sessionStorage.removeItem('myfitness_just_logged_in');
      return 'dashboard';
    }
    if (preferences?.lastActivePage && ALL_PAGES.includes(preferences.lastActivePage as PageType)) {
      return preferences.lastActivePage as PageType;
    }
    const saved = localStorage.getItem('myfitness_active_page');
    if (saved && ALL_PAGES.includes(saved as PageType)) {
      return saved as PageType;
    }
    return 'dashboard';
  });

  // If unauthenticated and on a locked page, reset to dashboard
  useEffect(() => {
    if (!isAuthenticated && LOCKED_PAGES.includes(activePage)) {
      setActivePage('dashboard');
    }
  }, [isAuthenticated, activePage]);

  useEffect(() => {
    if (justLoggedIn.current) {
      justLoggedIn.current = false;
      return;
    }
    if (preferences?.lastActivePage && ALL_PAGES.includes(preferences.lastActivePage as PageType)) {
      setActivePage(preferences.lastActivePage as PageType);
    }
  }, [preferences?.lastActivePage]);

  const savePreferencesMutation = useMutation({
    mutationFn: (prefs: { lastActivePage?: string }) =>
      saveUserPreferences(user!.uid, prefs),
  });

  useEffect(() => {
    if (user?.uid && activePage) {
      localStorage.setItem('myfitness_active_page', activePage);
      savePreferencesMutation.mutate({ lastActivePage: activePage });
      logUserActivity(user.uid, { type: 'page_view', page: activePage });
    }
  }, [activePage, user?.uid]);

  const handleNav = (page: string) => {
    if (page === 'exercises') {
      navigate('/exercises');
      return;
    }
    if (!isAuthenticated && LOCKED_PAGES.includes(page as PageType)) {
      navigate('/auth');
      return;
    }
    sessionStorage.setItem(`myfitness_scroll_${activePage}`, String(window.scrollY));
    setActivePage(page as PageType);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-elegant-light dark:gradient-elegant-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      <DashboardLayout
        onNav={handleNav}
        onLoginRequired={() => navigate('/auth')}
        centerPage={activePage}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<DashboardApp />} />
      </Routes>
    </BrowserRouter>
  );
}
