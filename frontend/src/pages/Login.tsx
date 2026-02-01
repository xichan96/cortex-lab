import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login as loginApi } from '@/apis/auth';
import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router';
import { useI18n } from '@/hooks/useI18n';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useI18n();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    
    try {
      const { token, user } = await loginApi(values);
      if (user && token) {
        login(user as any, token);
        message.success(t('login.success', '登录成功！'));
        navigate('/');
      } else {
        message.error(t('login.parseError', '登录失败，无法获取用户信息'));
      }
    } catch (error) {
      message.error(t('login.failed', '登录失败，请重试！'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ background: 'var(--login-bg)' }}
      className="min-h-screen w-full flex items-stretch justify-center p-4 sm:p-6 md:p-8"
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        <div className="hidden lg:flex h-full">
          <div className="relative flex-1 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/60 backdrop-blur-md shadow-2xl p-10 overflow-hidden">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-fuchsia-500/20 to-amber-400/20 blur-3xl" />
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-900/30 mb-6" />
              <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-color)] mb-3">
                {t('header.logo', 'CortexLab')}
              </h2>
              <p className="text-[var(--text-color-secondary)] leading-relaxed">
                {t('login.subtitle', '构建、管理与协作 AI 智能体的统一工作台')}
              </p>
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/60 p-4">
                  <div className="text-sm text-[var(--text-color-secondary)]">{t('login.feature1', '一站式工作流')}</div>
                  <div className="mt-1 font-semibold text-[var(--text-color)]">{t('login.feature1.desc', '从编辑到调试与发布')}</div>
                </div>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/60 p-4">
                  <div className="text-sm text-[var(--text-color-secondary)]">{t('login.feature2', '团队协作')}</div>
                  <div className="mt-1 font-semibold text-[var(--text-color)]">{t('login.feature2.desc', '角色与知识统一管理')}</div>
                </div>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/60 p-4">
                  <div className="text-sm text-[var(--text-color-secondary)]">{t('login.feature3', '多模型适配')}</div>
                  <div className="mt-1 font-semibold text-[var(--text-color)]">{t('login.feature3.desc', '快速切换与参数配置')}</div>
                </div>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/60 p-4">
                  <div className="text-sm text-[var(--text-color-secondary)]">{t('login.feature4', '安全与合规')}</div>
                  <div className="mt-1 font-semibold text-[var(--text-color)]">{t('login.feature4.desc', '细粒度权限与审计')}</div>
                </div>
              </div>
              <div className="mt-10 text-xs text-[var(--text-color-secondary)]">
                {t('login.tip', '建议使用现代浏览器以获得最佳体验')}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Card
            style={{
              width: '100%',
              maxWidth: 440,
              boxShadow: '0 12px 48px var(--shadow-color)',
              borderRadius: 16,
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
            }}
            styles={{
              body: { padding: '32px' }
            }}
          >
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-900/30" />
              <h1 className="mt-4 text-2xl font-bold text-[var(--text-color)]">
                {t('login.title', '欢迎登录')}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-color-secondary)]">
                {t('login.desc', '使用账号密码进入工作台')}
              </p>
            </div>
            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
              className="space-y-3"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: t('login.usernameRequired', '请输入用户名') }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder={t('login.usernamePlaceholder', '用户名')}
                  className="!h-12 !rounded-xl !bg-[var(--input-bg)] !border-[var(--card-border)] hover:!border-indigo-500 focus:!border-[var(--input-border-focus)]"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: t('login.passwordRequired', '请输入密码') }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder={t('login.passwordPlaceholder', '密码')}
                  className="!h-12 !rounded-xl !bg-[var(--input-bg)] !border-[var(--card-border)] hover:!border-indigo-500 focus:!border-[var(--input-border-focus)]"
                />
              </Form.Item>
              <div className="flex items-center justify-between -mt-1">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>{t('login.remember', '记住我')}</Checkbox>
                </Form.Item>
                <button
                  type="button"
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  {t('login.forgot', '忘记密码？')}
                </button>
              </div>
              <Form.Item className="!mt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="!h-12 !w-full !text-base !font-semibold !rounded-xl"
                >
                  {t('login.submit', '登录')}
                </Button>
              </Form.Item>
            </Form>
            <div className="mt-4 text-center text-xs text-[var(--text-color-secondary)]">
              <span className="hover:text-[var(--text-color)] cursor-default">{t('login.privacy', '隐私政策')}</span>
              <span className="mx-2">·</span>
              <span className="hover:text-[var(--text-color)] cursor-default">{t('login.terms', '服务条款')}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
