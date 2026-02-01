import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { PageLoading } from './Loading';
import { useI18n } from '@/hooks/useI18n';
import { checkInstall } from '@/apis/setup';
import { useNavigate, useLocation } from 'react-router';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const { validateToken } = useAuthStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await checkInstall();
        // The API returns { installed: boolean }
        // Note: Axios interceptor might unwrap data. Check checkInstall return type.
        // Assuming request helper returns data directly.
        const installed = res.installed;

        if (!installed) {
            if (location.pathname !== '/setup') {
                navigate('/setup');
                return;
            }
            setInitializing(false);
            return;
        }

        if (installed && location.pathname === '/setup') {
            navigate('/');
            return;
        }
        
        // If installed, proceed to auth check
        await validateToken();
      } catch (error) {
        console.error("Initialization failed", error);
        // Fallback: If checkInstall fails (e.g. 500), maybe show error or assume installed?
        // If 404, maybe old backend?
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [validateToken, navigate, location.pathname]);

  if (initializing) {
    return <PageLoading tip={t('app.initializing', '初始化中...')} />;
  }

  return <>{children}</>;
};
