"use client";
import React, { useEffect, useRef } from "react";
import * as LR from "@uploadcare/blocks";
import { useRouter } from "next/navigation";

type Props = {
  onUpload: (cdnUrl: string) => Promise<void>;
};

LR.registerBlocks(LR);

const UploadCareButton = ({ onUpload }: Props) => {
  const router = useRouter();
  const ctxProviderRef = useRef<
    typeof LR.UploadCtxProvider.prototype & LR.UploadCtxProvider
  >(null);

  useEffect(() => {
    const handleUpload = async (e: Event) => {
      const customEvent = e as CustomEvent<{ cdnUrl: string }>;
      await onUpload(customEvent.detail.cdnUrl);
      router.refresh();
    };

    const currentCtxProvider = ctxProviderRef.current;

    currentCtxProvider?.addEventListener("file-upload-success", handleUpload);

    return () => {
      currentCtxProvider?.removeEventListener(
        "file-upload-success",
        handleUpload
      );
    };
  }, [onUpload, router]);

  return (
    <div>
      <lr-config ctx-name="my-uploader" pubkey="f908b6ff47aba6efd711" />

      <lr-file-uploader-regular
        ctx-name="my-uploader"
        css-src={`https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.35.2/web/lr-file-uploader-regular.min.css`}
      />

      <lr-upload-ctx-provider ctx-name="my-uploader" ref={ctxProviderRef} />
    </div>
  );
};

export default UploadCareButton;
