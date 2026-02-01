import { useEffect, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router';
import { Menu, MenuProps } from 'antd';
import { type ItemType } from "antd/es/menu/interface";
import styles from './index.module.scss';

export interface SiderProps {
  title?: React.ReactNode;
  menus?: ItemType[];
  style?: React.CSSProperties;
}

export default function Sider(props: SiderProps) {
  const {
    title,
    menus = [],
    style = {},
  } = props;
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const navigate = useNavigate();
  const handleClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('http')) {
      window.open(key, '_blank');
      return;
    }
    navigate(key);
  };

  useEffect(() => {
    const matches = getMatchMenus(menus, location.pathname);
    if (matches) {
      setSelectedKeys(matches.slice(-1));
      setOpenKeys(matches);
    }
  }, [menus, location]);

  return (
    <div className={styles.sider} style={style}>
      {title && (
        <header className={styles.header}>
          {title}
        </header>
      )}
      <div className={styles.menu}>
        {menus.length > 0 && (
          <Menu
            mode="inline"
            items={menus}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onClick={handleClick}
          />
        )}
      </div>
    </div>
  );
}

const getMatchMenus = (data: ItemType[] = [], key: string) => {
  const keys = Object.keys(flatKeys(data));
  return keys
    .filter((k) => {
      if (k === '/' || key === '/') return

      return matchPath(`${k}/*`, key);
    })
    .sort((a, b) => {
      if (a === key) return 1;
      if (b === key) return -1;
      return a.length - b.length;
    });
}

export const flatKeys = (data: ItemType[] = []) => {
  let keys: Record<string, ItemType> = {};

  data.forEach((i) => {
    if (!i || !i.key) return;

    keys[i.key as unknown as string] = { ...i };

    if ('children' in i) {
      keys = {
        ...keys,
        ...flatKeys(i.children),
      };
    }
  });
  
  return keys;
}

