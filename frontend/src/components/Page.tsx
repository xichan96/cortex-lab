interface PageProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

export default function Page({ title, description, children, extra }: PageProps) {
  return (
    <div className="fade-in">
      {title && (
        <div className="page-header">
          <h1 className="page-title">{title}</h1>
          {description && (
            <p className="page-description">{description}</p>
          )}
          {extra && (
            <div className="page-extra">{extra}</div>
          )}
        </div>
      )}

      {children}
    </div>
  )
}

