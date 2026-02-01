import React, { useState } from 'react';
import { Form, Input, Button, Card, Radio, message, InputNumber } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import { installSystem, InstallRequest } from '@/apis/setup';
import { useNavigate } from 'react-router';

const Setup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dbDriver, setDbDriver] = useState<'mysql' | 'sqlite'>('sqlite');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: InstallRequest) => {
    setLoading(true);
    try {
      await installSystem(values);
      message.success('Installation successful! Please wait for restart...');
      // Wait for a few seconds then reload to root
      setTimeout(() => {
         window.location.href = '/';
      }, 3000);
    } catch (error) {
       // message.error('Installation failed'); // Handled by global interceptor usually
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f0f2f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Card
        title={
            <div style={{ textAlign: 'center' }}>
                <DatabaseOutlined style={{ fontSize: 24, marginRight: 8 }} />
                <span style={{ fontSize: 20 }}>Cortex Lab Setup</span>
            </div>
        }
        style={{
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 8,
        }}
      >
        <Form
          form={form}
          name="setup"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{
            db_driver: 'sqlite',
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            database: 'cortex_lab',
            path: 'cortex_lab.db'
          }}
        >
          <Form.Item
            name="db_driver"
            label="Database Type"
            rules={[{ required: true }]}
          >
            <Radio.Group onChange={e => setDbDriver(e.target.value)}>
              <Radio.Button value="sqlite">SQLite (Local)</Radio.Button>
              <Radio.Button value="mysql">MySQL</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {dbDriver === 'sqlite' ? (
             <Form.Item
                name="path"
                label="Database Path"
                rules={[{ required: true, message: 'Please enter database path' }]}
                tooltip="Relative to application root, e.g., cortex_lab.db"
             >
                <Input placeholder="cortex_lab.db" />
             </Form.Item>
          ) : (
            <>
                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="host"
                        label="Host"
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="port"
                        label="Port"
                        rules={[{ required: true }]}
                        style={{ width: 100 }}
                    >
                        <InputNumber min={1} max={65535} style={{ width: '100%' }} />
                    </Form.Item>
                </div>
                <Form.Item
                    name="user"
                    label="Username"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="database"
                    label="Database Name"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
            </>
          )}

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Install & Initialize
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Setup;
