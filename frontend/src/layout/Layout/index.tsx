import React from "react";
import Header, { type HeaderProps } from "./Header";
import Sider, { type SiderProps } from "./Sider";

export const Layout: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div className="w-full" style={style}>
    {children}
  </div>
);

export const Main: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style = {} }) => (
  <div 
    className="h-screen pt-12 flex bg-[var(--body-bg)]" 
    style={style}
  >
    {children}
  </div>
);

export const Content: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style = {} }) => (
  <div 
    className="w-full min-h-full overflow-y-auto bg-[var(--body-bg)] p-3 sm:p-4 md:p-6 lg:p-8" 
    style={style}
  >
    {children}
  </div>
);

export {
  Header,
  Sider,
  type HeaderProps,
  type SiderProps,
};

