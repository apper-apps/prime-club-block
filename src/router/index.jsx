import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '@/components/organisms/Layout';

// Lazy load all page components
const Dashboard = lazy(() => import('@/components/pages/Dashboard'));
const Leads = lazy(() => import('@/components/pages/Leads'));
const Hotlist = lazy(() => import('@/components/pages/Hotlist'));
const Pipeline = lazy(() => import('@/components/pages/Pipeline'));
const Analytics = lazy(() => import('@/components/pages/Analytics'));
const Calendar = lazy(() => import('@/components/pages/Calendar'));
const Leaderboard = lazy(() => import('@/components/pages/Leaderboard'));
const Contacts = lazy(() => import('@/components/pages/Contacts'));
const Teams = lazy(() => import('@/components/pages/Teams'));
const WebsiteUrlReport = lazy(() => import('@/components/pages/WebsiteUrlReport'));
const NotFound = lazy(() => import('@/components/pages/NotFound'));

// Suspense fallback component
const SuspenseFallback = ({ children }) => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    </div>
  }>
    {children}
  </Suspense>
);

// Main routes configuration
const mainRoutes = [
  {
    path: "",
    index: true,
    element: <SuspenseFallback><Dashboard /></SuspenseFallback>
  },
  {
    path: "leads",
    element: <SuspenseFallback><Leads /></SuspenseFallback>
  },
  {
    path: "hotlist", 
    element: <SuspenseFallback><Hotlist /></SuspenseFallback>
  },
  {
    path: "pipeline",
    element: <SuspenseFallback><Pipeline /></SuspenseFallback>
  },
  {
    path: "analytics",
    element: <SuspenseFallback><Analytics /></SuspenseFallback>
  },
  {
    path: "calendar",
    element: <SuspenseFallback><Calendar /></SuspenseFallback>
  },
  {
    path: "leaderboard",
    element: <SuspenseFallback><Leaderboard /></SuspenseFallback>
  },
  {
    path: "contacts",
    element: <SuspenseFallback><Contacts /></SuspenseFallback>
  },
  {
    path: "teams",
    element: <SuspenseFallback><Teams /></SuspenseFallback>
  },
  {
    path: "website-url-report",
    element: <SuspenseFallback><WebsiteUrlReport /></SuspenseFallback>
  },
  {
    path: "*",
    element: <SuspenseFallback><NotFound /></SuspenseFallback>
  }
];

// Router configuration
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: mainRoutes
  }
];

export const router = createBrowserRouter(routes);