import { useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { useAuthStore, useThemeStore, useLocaleStore } from '@/store';
import { Button, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, KeyOutlined, SunOutlined, MoonOutlined, GlobalOutlined } from '@ant-design/icons';
import ChangePasswordModal from '@/components/User/ChangePasswordModal';
import styles from './index.module.scss';
import { useI18n } from '@/hooks/useI18n';

export interface HeaderProps {
  showLogo?: boolean;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties
}

export default function Header(props: HeaderProps) {
  const {
    showLogo = true,
    children,
    extra,
    style,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { locale, setLocale } = useLocaleStore();
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const { t } = useI18n();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleNavigate = (path: string) => {
    if (!isActivePath(path)) {
      navigate(path);
    }
  };

  const userMenuItems: any[] = [];

  if (user?.role === 'admin') {
    userMenuItems.push(
      {
        key: 'users',
        label: t('header.users', '用户管理'),
        icon: <UserOutlined />,
        onClick: () => handleNavigate('/users'),
        disabled: isActivePath('/users'),
      },
      {
        key: 'settings',
        label: t('header.settings', '系统设置'),
        icon: <SettingOutlined />,
        onClick: () => handleNavigate('/settings'),
        disabled: isActivePath('/settings'),
      }
    );
  }

  userMenuItems.push({
    key: 'change-password',
    label: t('header.changePassword', '修改密码'),
    icon: <KeyOutlined />,
    onClick: () => setChangePasswordModalVisible(true),
  });

  userMenuItems.push({
    key: 'logout',
    label: t('header.logout', '退出登陆'),
    icon: <LogoutOutlined />,
    onClick: handleLogout,
    disabled: false,
  });

  const langMenuItems: any[] = [
    {
      key: 'lang-zh',
      label: t('header.lang.zh', '中文'),
      onClick: () => setLocale('zh'),
    },
    {
      key: 'lang-en',
      label: t('header.lang.en', 'English'),
      onClick: () => setLocale('en'),
    },
  ];

  return (
    <header className={styles.wrap} style={style}>
      <div className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          {showLogo && (
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {t('header.logo', 'CortexLab')}
            </span>
          )}
        </div>

        <div className={styles.link}>
          {children}
        </div>

        <div className={styles.right}>
          <Button
            type="text"
            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{ marginRight: 8 }}
          />
          <Dropdown menu={{ items: langMenuItems }} placement="bottomRight">
            <Button type="text" icon={<GlobalOutlined />}>
              {locale === 'zh' ? t('header.lang.zh', '中文') : 'EN'}
            </Button>
          </Dropdown>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                {user.username}
              </Button>
            </Dropdown>
          )}
          {extra}
        </div>
      </div>
      <ChangePasswordModal
        open={changePasswordModalVisible}
        onCancel={() => setChangePasswordModalVisible(false)}
      />
    </header >
  );
}
