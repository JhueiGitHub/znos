"use client";

import { useEffect, useState } from "react";
import { DialogContainerProvider } from "@dis/components/ui/dialog";
import { CreateServerModal } from "@dis/components/modals/create-server-modal";
import { InviteModal } from "@dis/components/modals/invite-modal";
import { MembersModal } from "@dis/components/modals/members-modal";
import { CreateChannelModal } from "@dis/components/modals/create-channel-modal";
import { LeaveServerModal } from "@dis/components/modals/leave-server-modal";
import { DeleteServerModal } from "@dis/components/modals/delete-server-modal";
import { DeleteChannelModal } from "@dis/components/modals/delete-channel-modal";
import { EditChannelModal } from "@dis/components/modals/edit-channel-modal";
import { MessageFileModal } from "@dis/components/modals/message-file-modal";
import { DeleteMessageModal } from "@dis/components/modals/delete-message-modal";

interface ModalProviderProps {
  container: HTMLElement | null;
}

export const ModalProvider = ({ container }: ModalProviderProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <DialogContainerProvider container={container}>
      <CreateServerModal
        onServerCreated={(id) => {
          console.log("Server created with ID:", id);
        }}
      />
      <InviteModal />
      <MembersModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
      <MessageFileModal />
      <DeleteMessageModal />
    </DialogContainerProvider>
  );
};