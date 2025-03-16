"use client";

import React, { ReactNode } from "react";
import { LearningProvider } from "./LearningContext";

interface LearningProviderWrapperProps {
  children: ReactNode;
}

const LearningProviderWrapper: React.FC<LearningProviderWrapperProps> = ({
  children,
}) => {
  return <LearningProvider>{children}</LearningProvider>;
};

export default LearningProviderWrapper;
