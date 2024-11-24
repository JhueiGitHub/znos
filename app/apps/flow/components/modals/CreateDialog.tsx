"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { StreamType, FlowType } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useStyles } from "@os/hooks/useStyles";

export type ViewType = "streams" | "apps" | "app" | "stream" | "editor";

interface CreateDialogProps {
  currentView: ViewType;
  viewId?: string;
}

interface ViewConfig {
  buttonText: string;
  title: string;
  description: string;
  placeholder: string;
  successMessage: string;
  streamType?: StreamType;
  flowType?: FlowType;
  visible: boolean;
}

const VIEW_CONFIGS: Record<ViewType, ViewConfig> = {
  streams: {
    buttonText: "Stream",
    title: "Create New Stream",
    description: "Create a new stream to organize your flows.",
    placeholder: "Enter stream name...",
    successMessage: "Successfully created new stream!",
    streamType: "CORE",
    visible: true,
  },
  apps: {
    buttonText: "",
    title: "",
    description: "",
    placeholder: "",
    successMessage: "",
    visible: false,
  },
  app: {
    buttonText: "Stream",
    title: "Create New App Stream",
    description: "Create a new stream for this app's configuration.",
    placeholder: "Enter stream name...",
    successMessage: "Successfully created new app stream!",
    streamType: "CONFIG",
    visible: true,
  },
  stream: {
    buttonText: "Flow",
    title: "Create New Flow",
    description: "Create a new flow in this stream.",
    placeholder: "Enter flow name...",
    successMessage: "Successfully created new flow!",
    flowType: "CORE",
    visible: true,
  },
  editor: {
    buttonText: "",
    title: "",
    description: "",
    placeholder: "",
    successMessage: "",
    visible: false,
  },
};

export function CreateDialog({ currentView, viewId }: CreateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { getColor, getFont } = useStyles();

  const config = VIEW_CONFIGS[currentView];

  if (!config.visible) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setFeedback("Please enter a name");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      switch (currentView) {
        case "streams":
          await axios.post("/api/streams", {
            name,
            description,
            type: config.streamType,
          });
          queryClient.invalidateQueries(["streams"]);
          break;

        case "app":
          if (!viewId) throw new Error("App ID required");
          await axios.post("/api/streams", {
            name,
            description,
            type: config.streamType,
            appId: viewId,
          });
          queryClient.invalidateQueries(["app-streams", viewId]);
          break;

        case "stream":
          if (!viewId) throw new Error("Stream ID required");
          const stream = await axios.get(`/api/streams/${viewId}`);
          await axios.post(`/api/flows`, {
            name,
            description,
            streamId: viewId,
            type: stream.data.type === "CONFIG" ? "CONFIG" : "CORE",
          });
          queryClient.invalidateQueries(["stream", viewId]);
          break;
      }

      setFeedback(config.successMessage);
      setTimeout(() => {
        setIsOpen(false);
        setName("");
        setDescription("");
        setFeedback(null);
      }, 1500);
    } catch (error) {
      console.error("Creation error:", error);
      setFeedback("Failed to create. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="h-8 px-4 text-[11px] hover:opacity-90"
          style={{
            backgroundColor: getColor("Lilac Accent"),
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          <Plus className="w-2 h-2 mr-1.5" />
          {config.buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px] border"
        style={{
          backgroundColor: getColor("Glass"),
          borderColor: getColor("Brd"),
          color: getColor("Text Primary (Hd)"),
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            {config.title}
          </DialogTitle>
          <DialogDescription
            style={{
              color: getColor("Text Secondary (Bd)"),
              fontFamily: getFont("Text Secondary"),
            }}
          >
            {config.description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="name"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={config.placeholder}
              className="border"
              style={{
                backgroundColor: getColor("Overlaying BG"),
                borderColor: getColor("Brd"),
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="description"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Description (Optional)
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              className="border"
              style={{
                backgroundColor: getColor("Overlaying BG"),
                borderColor: getColor("Brd"),
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
              disabled={isSubmitting}
            />
          </div>
          {feedback && (
            <p
              className={`text-sm ${
                feedback === config.successMessage
                  ? "text-green-500"
                  : "text-red-500"
              }`}
              style={{
                fontFamily: getFont("Text Secondary"),
              }}
            >
              {feedback}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: getColor("Lilac Accent"),
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
