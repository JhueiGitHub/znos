// app/components/IntroScreen/index.tsx
"use client";

import IntroClient from "./IntroClient";
import React from "react";

interface IntroScreenProps {
  profileId: string;
}

const IntroScreen = async ({ profileId }: IntroScreenProps) => {
  return <IntroClient profileId={profileId} />;
};

export default IntroScreen;