import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';
import { useI18n } from '@/hooks/useI18n';

export default function NoAuth() {
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
        status="403"
        title="403"
        subTitle={t('result.403.subtitle', '抱歉，您没有权限访问此页面。')}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            {t('result.backHome', '返回首页')}
          </Button>
        }
      />
    </div>
  );
}
