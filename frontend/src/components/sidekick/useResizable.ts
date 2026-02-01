import { useState, useEffect } from 'react';

interface UseResizableOptions {
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  direction?: 'left' | 'right';
}

export function useResizable({
  initialWidth = 400,
  minWidth = 300,
  maxWidth = 800,
  direction = 'left'
}: UseResizableOptions = {}) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth;
      if (direction === 'left') {
        newWidth = document.body.clientWidth - e.clientX;
      } else {
        newWidth = e.clientX;
      }

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, direction]);

  return { width, isResizing, setIsResizing };
}
