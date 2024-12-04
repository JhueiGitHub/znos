import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";
import Desktop from "./components/Desktop";
import IntroScreen from "./components/IntroScreen/IntroClient";

const SetupPage = async () => {
  const profile = await initialProfile();

  const designSystem = await db.designSystem.findUnique({
    where: {
      profileId: profile.id,
    },
    include: {
      colorTokens: true,
      typographyTokens: true,
    },
  });

  if (!designSystem) {
    return redirect("/error");
  }

  // Check if user has seen intro
  if (!profile.hasSeenIntro) {
    return <IntroScreen profileId={profile.id} />;
  }

  return <Desktop />;
};

export default SetupPage;
