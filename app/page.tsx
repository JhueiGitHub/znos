// app/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";
import Desktop from "./components/Desktop";

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

  return <Desktop />;
};

export default SetupPage;
