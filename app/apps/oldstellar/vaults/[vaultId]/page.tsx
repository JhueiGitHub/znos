import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

interface VaultPageProps {
  params: {
    vaultId: string;
  };
}

const VaultPage = async ({ params }: VaultPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return notFound();
  }

  const vault = await db.vault.findUnique({
    where: {
      id: params.vaultId,
      profileId: profile.id,
    },
    include: {
      folders: true,
      notes: true,
    },
  });

  if (!vault) {
    return notFound();
  }

  return (
    <div>
      <h1>{vault.name}</h1>
      {/* Add your Obsidian app UI components here */}
      {/* For example: */}
      {/* <ObsidianSidebar vault={vault} /> */}
      {/* <NoteEditor /> */}
    </div>
  );
};

export default VaultPage;
