// app/api/profile/reset-loom/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Use a transaction to ensure all operations complete or none do
    await db.$transaction(async (tx) => {
      // First, delete all existing Loom data for this user

      // Delete all comments on user's videos
      await tx.comment.deleteMany({
        where: {
          Video: {
            User: {
              clerkid: user.id,
            },
          },
        },
      });

      // Delete all videos
      await tx.video.deleteMany({
        where: {
          User: {
            clerkid: user.id,
          },
        },
      });

      // Delete all folders
      await tx.folder.deleteMany({
        where: {
          WorkSpace: {
            User: {
              clerkid: user.id,
            },
          },
        },
      });

      // Delete workspace memberships
      await tx.opalMember.deleteMany({
        where: {
          User: {
            clerkid: user.id,
          },
        },
      });

      // Delete workspaces
      await tx.workSpace.deleteMany({
        where: {
          User: {
            clerkid: user.id,
          },
        },
      });

      // Delete notifications
      await tx.notification.deleteMany({
        where: {
          User: {
            clerkid: user.id,
          },
        },
      });

      // Delete invites
      await tx.invite.deleteMany({
        where: {
          OR: [
            { sender: { clerkid: user.id } },
            { reciever: { clerkid: user.id } },
          ],
        },
      });

      // Delete media studio
      await tx.media.deleteMany({
        where: {
          User: {
            clerkid: user.id,
          },
        },
      });

      // Delete subscription
      await tx.subscription.deleteMany({
        where: {
          User: {
            clerkid: user.id,
          },
        },
      });

      // Delete the user
      await tx.user.deleteMany({
        where: {
          clerkid: user.id,
        },
      });

      // Create fresh user with initial data
      const newUser = await tx.user.create({
        data: {
          clerkid: user.id,
          email: user.emailAddresses[0].emailAddress,
          firstname: user.firstName ?? "",
          lastname: user.lastName ?? "",
          image: user.imageUrl,
          firstView: false,
          trial: false,
          studio: {
            create: {
              preset: "SD",
            },
          },
          subscription: {
            create: {
              plan: "FREE",
            },
          },
          workspace: {
            create: [
              {
                name: `${user.firstName ?? "My"}'s Workspace`,
                type: "PERSONAL",
                folders: {
                  create: [
                    {
                      name: "My Videos",
                    },
                  ],
                },
              },
            ],
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESET_LOOM]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
