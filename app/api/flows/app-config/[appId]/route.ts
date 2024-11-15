// import { NextResponse } from "next/server";
// import { currentProfile } from "@/lib/current-profile";
// import { db } from "@/lib/db";
// import { APP_DEFINITIONS } from "@/app/types/flow";

// export async function GET(
//   req: Request,
//   { params }: { params: { appId: string } }
// ) {
//   try {
//     const profile = await currentProfile();
//     if (!profile) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     // Find existing app config flow
//     let flow = await db.flow.findFirst({
//       where: {
//         appId: params.appId,
//         isAppConfig: true,
//         stream: {
//           profileId: profile.id,
//         },
//       },
//       include: {
//         components: true,
//       },
//     });

//     // If no existing config, create one
//     if (!flow) {
//       const appDef = APP_DEFINITIONS[params.appId];
//       if (!appDef) {
//         return new NextResponse("App not found", { status: 404 });
//       }

//       // Get OS stream
//       const osStream = await db.stream.findFirst({
//         where: {
//           name: "OS",
//           profileId: profile.id,
//         },
//       });

//       if (!osStream) {
//         return new NextResponse("OS stream not found", { status: 404 });
//       }

//       // Create new app config flow
//       flow = await db.flow.create({
//         data: {
//           name: "Zenith",
//           streamId: osStream.id,
//           type: "APP_CONFIG",
//           isAppConfig: true,
//           appId: params.appId,
//           nodes: appDef.defaultNodes,
//         },
//         include: {
//           components: true,
//         },
//       });
//     }

//     return NextResponse.json(flow);
//   } catch (error) {
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }
