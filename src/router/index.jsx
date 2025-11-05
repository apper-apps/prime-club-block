import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { getRouteConfig } from "./route.utils";
import Root from "@/layouts/Root";
import Layout from "@/components/organisms/Layout";
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

// Authentication pages
const Login = lazy(() => import('@/components/pages/Login'));
const Signup = lazy(() => import('@/components/pages/Signup'));
const Callback = lazy(() => import('@/components/pages/Callback'));
const ErrorPage = lazy(() => import('@/components/pages/ErrorPage'));
const ResetPassword = lazy(() => import('@/components/pages/ResetPassword'));
const PromptPassword = lazy(() => import('@/components/pages/PromptPassword'));

// createRoute helper function
const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  // Get config for this route
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

// Main application routes
const mainRoutes = [
  createRoute({
    index: true,
    element: <Dashboard />
  }),
  createRoute({
    path: "leads",
    element: <Leads />
  }),
  createRoute({
    path: "hotlist", 
    element: <Hotlist />
  }),
  createRoute({
    path: "pipeline",
    element: <Pipeline />
  }),
  createRoute({
    path: "analytics",
    element: <Analytics />
  }),
  createRoute({
    path: "calendar",
    element: <Calendar />
  }),
  createRoute({
    path: "leaderboard",
    element: <Leaderboard />
  }),
  createRoute({
    path: "contacts",
    element: <Contacts />
  }),
  createRoute({
    path: "teams",
    element: <Teams />
  }),
  createRoute({
    path: "website-url-report",
    element: <WebsiteUrlReport />
  }),
  createRoute({
    path: "*",
    element: <NotFound />
  })
];

// Router configuration
const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: mainRoutes
      },
      createRoute({
        path: "login",
        element: <Login />
      }),
      createRoute({
        path: "signup",
        element: <Signup />
      }),
      createRoute({
        path: "callback",
        element: <Callback />
      }),
      createRoute({
        path: "error",
        element: <ErrorPage />
      }),
      createRoute({
        path: "prompt-password/:appId/:emailAddress/:provider",
        element: <PromptPassword />
      }),
      createRoute({
        path: "reset-password/:appId/:fields",
        element: <ResetPassword />
      })
    ]
  }
];

export const router = createBrowserRouter(routes);