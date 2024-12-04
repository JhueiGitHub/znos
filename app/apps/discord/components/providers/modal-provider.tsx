"use client";

import { useEffect, useState } from "react";

import { EditServerModal } from "@dis/components/modals/edit-server-modal";
import { InviteModal } from "@dis/components/modals/invite-modal";
import { CreateServerModal } from "@dis/components/modals/create-server-modal";
import { MembersModal } from "@dis/components/modals/members-modal";
import { CreateChannelModal } from "@dis/components/modals/create-channel-modal";
import { LeaveServerModal } from "@dis/components/modals/leave-server-modal";
import { DeleteServerModal } from "@dis/components/modals/delete-server-modal";
import { DeleteChannelModal } from "@dis/components/modals/delete-channel-modal";
import { EditChannelModal } from "@dis/components/modals/edit-channel-modal";
import { MessageFileModal } from "@dis/components/modals/message-file-modal";
import { DeleteMessageModal } from "@dis/components/modals/delete-message-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateServerModal
        onServerCreated={(id) => {
          // Handle server creation here
          console.log("Server created with ID:", id);
          // You might want to update some global state or trigger a re-fetch of servers
        }}
      />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
      <MessageFileModal />
      <DeleteMessageModal />
    </>
  );
};
