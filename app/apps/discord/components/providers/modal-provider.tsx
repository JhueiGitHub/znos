"use client";

import { CreateServerModal } from "@dis/components/modals/create-server-modal";
import { useEffect, useState } from "react";

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
    </>
  );
};
