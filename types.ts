import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Server, Member, Profile } from "@prisma/client";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
};

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
export interface StellarProfile {
  id: string;
  profileId: string;
  name: string;
  driveCapacity: bigint;
  currentUsage: number;
  rootFolder: StellarFolder;
}

export interface StellarFolder {
  id: string;
  name: string;
  parentId: string | null;
  stellarProfileId: string;
  isRoot: boolean;
  children: StellarFolder[];
  files: StellarFile[];
}

export interface StellarFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  stellarFolderId: string;
}
