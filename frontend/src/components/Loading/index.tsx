import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  spinning?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'default',
  tip = '加载中...',
  spinning = true,
  children,
  style,
  className,
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 24 : size === 'small' ? 16 : 20 }} spin />;

  if (children) {
    return (
      <Spin
        spinning={spinning}
        tip={tip}
        indicator={antIcon}
        style={style}
        className={className}
      >
        {children}
      </Spin>
    );
  }

  return (
    <Spin
      spinning={spinning}
      tip={tip}
      indicator={antIcon}
      size={size}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          ...style
        }}
        className={className}
      />
    </Spin>
  );
};

export const PageLoading: React.FC<{ tip?: string }> = ({ tip = '页面加载中...' }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Spin
        size="large"
        tip={tip}
        indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
      >
        <div />
      </Spin>
    </div>
  );
};

export const InlineLoading: React.FC<{ tip?: string; size?: 'small' | 'default' | 'large' }> = ({
  tip = '加载中...',
  size = 'default'
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Spin
        size={size}
        tip={tip}
        indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 24 : size === 'small' ? 16 : 20 }} spin />}
      >
        <div />
      </Spin>
    </div>
  );
};

export default Loading;

