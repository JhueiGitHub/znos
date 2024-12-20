"use client";

import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
  const fileType = value?.split(".").pop();
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        <Image fill src={value} alt="Upload" className="rounded-full" />
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div
        whileHover="animate"
        className="h-32 pt-[36px] group/file block rounded-lg cursor-pointer w-full relative"
      >
        <div className="absolute inset-0 opacity-0 w-full h-full">
          <UploadDropzone
            endpoint={endpoint}
            onUploadProgress={(progress) => {
              setUploadProgress(progress);
            }}
            onClientUploadComplete={(res) => {
              onChange(res?.[0].url);
              setPreviewFiles([]);
              setUploadProgress(0);
            }}
            onUploadError={(error: Error) => {
              console.log(error);
              setUploadProgress(0);
            }}
          />
        </div>

        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          {previewFiles.length > 0 ? (
            <div className="relative">
              <motion.div
                layoutId="file-upload"
                className="relative overflow-hidden z-40 bg-[#010203] flex flex-col items-start justify-start p-4 w-full max-w-[8rem] mx-auto rounded-md border border-[#4C4F69]"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  layout
                  className="text-base text-[#CCCCCC] truncate max-w-xs"
                >
                  {previewFiles[0].name}
                </motion.p>
              </motion.div>
              {/* EVOLVED: Progress bar */}
              {uploadProgress > 0 && (
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#4C4F69]/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#4C4F69]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="relative group-hover/file:shadow-2xl z-40 bg-[#010203]/50 border border-[#4C4F69] flex items-center justify-center h-24 w-24 rounded-md"
              >
                <IconUpload className="h-6 w-6 text-[#4C4F69]" />
              </motion.div>
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-[#4C4F69] inset-0 z-30 bg-transparent flex items-center justify-center h-24 w-24 mx-auto rounded-md"
              />
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// PRESERVED: Existing GridPattern component
export function GridPattern() {
  const columns = 30;
  const rows = 8;

  return (
    <div className="flex bg-[#010203]/30 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-8 h-8 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-[#010203]/50"
                  : "bg-[#010203]/50 shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
