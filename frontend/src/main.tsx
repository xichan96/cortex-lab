import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeConfigProvider } from './components/ThemeConfigProvider';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import '@ant-design/v5-patch-for-react-19';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeConfigProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

window.addEventListener('error', (event) => {
  if (event.message.includes('Failed to fetch dynamically imported module')) {
    window.location.reload();
  }
});
