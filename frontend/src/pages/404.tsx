import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';
import { useI18n } from '@/hooks/useI18n';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Result
        status="404"
        title="404"
        subTitle={t('result.404.subtitle', '抱歉，您访问的页面不存在。')}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            {t('result.backHome', '返回首页')}
          </Button>
        }
      />
    </div>
  );
}
