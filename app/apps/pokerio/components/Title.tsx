import React, { useEffect } from "react";

interface TitleProps {
  children: string;
}

const Title: React.FC<TitleProps> = ({ children }) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = children;
    
    return () => {
      document.title = originalTitle;
    };
  }, [children]);

  return null;
};

export default Title;
