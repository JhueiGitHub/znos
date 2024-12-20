// app/api/obsidian/profile-vault/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET() {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the user's vault
    const vault = await db.vault.findFirst({
      where: {
        profileId: profile.id,
      },
    });

    if (!vault) {
      return new NextResponse("Vault not found", { status: 404 });
    }

    return NextResponse.json(vault);
  } catch (error) {
    console.error("[PROFILE_VAULT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
