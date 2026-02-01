import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import Login from '../pages/Login';
import { PublicRoute, RoleBasedRedirect, ProtectedRoute } from './guard';
import NoAuth from '@/pages/403';
import NotFound from '@/pages/404';
import { lazy, Suspense } from 'react';
import { PageLoading } from '@/components/Loading';
import AppLayout from '@/layout/AppLayout';
import { AppInitializer } from '@/components/AppInitializer';

const Chat = lazy(() => import('@/pages/Chat'));
const Roles = lazy(() => import('@/pages/Roles'));

const Skills = lazy(() => import('@/pages/Skills'));
const SkillDetail = lazy(() => import('@/pages/SkillDetail'));
const PromptEditor = lazy(() => import('@/pages/PromptEditor'));
const Users = lazy(() => import('@/pages/Users'));
const Settings = lazy(() => import('@/pages/Settings'));
const Setup = lazy(() => import('@/pages/Setup'));

export const router = createBrowserRouter([
  {
    element: (
      <AppInitializer>
        <Outlet />
      </AppInitializer>
    ),
    children: [
      {
        path: 'setup',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Setup />
          </Suspense>
        ),
      },
      {
        path: '/',
        children: [
          {
            index: true,
            element: <Navigate to="/chat" replace />,
          },
          {
            path: 'chat',
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}>
                  <AppLayout />
                </Suspense>
              </ProtectedRoute>
            ),
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<PageLoading />}>
                    <Chat />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'role',
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}>
                  <AppLayout />
                </Suspense>
              </ProtectedRoute>
            ),
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<PageLoading />}>
                    <Roles />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'skills',
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}>
                  <AppLayout />
                </Suspense>
              </ProtectedRoute>
            ),
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<PageLoading />}>
                    <Skills />
                  </Suspense>
                ),
              },
              {
                path: ':skillId',
                element: (
                  <Suspense fallback={<PageLoading />}>
                    <SkillDetail />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'skills/:skillId/prompts/:promptId/edit',
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}>
                  <PromptEditor />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'users',
            element: (
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoading />}>
                  <AppLayout />
                </Suspense>
              </ProtectedRoute>
            ),
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<PageLoading />}>
                    <Users />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'settings',
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}>
                  <AppLayout />
                </Suspense>
              </ProtectedRoute>
            ),
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<PageLoading />}>
                    <Settings />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
      {
        path: '/login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: '/403',
        element: <NoAuth />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
