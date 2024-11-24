import React, { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useStyles } from "@os/hooks/useStyles";

interface NewFlowDialogProps {
  streamId: string;
  onFlowCreated?: () => void;
}

export const NewFlowDialog = ({ streamId, onFlowCreated }: NewFlowDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [flowName, setFlowName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { getColor, getFont } = useStyles();

  const createFlowMutation = useMutation({
    mutationFn: async () => {
      // First get the stream to get its design system ID
      const { data: stream } = await axios.get(`/api/streams/${streamId}`);

      // Create the new flow
      const { data } = await axios.post("/api/flows", {
        name: flowName,
        description: "OS Configuration",
        type: "CONFIG",
        streamId,
        designSystemId: stream.flows[0]?.designSystemId,
        components: [
          {
            name: "Wallpaper",
            type: "WALLPAPER",
            value: "/media/wallpaper.jpg",
            order: 0,
          },
          {
            name: "Finder",
            type: "DOCK_ICON",
            value: "/icns/_finder.png",
            order: 1,
          },
          {
            name: "Flow",
            type: "DOCK_ICON",
            value: "/icns/_flow.png",
            order: 2,
          },
          {
            name: "Discord",
            type: "DOCK_ICON",
            value: "/icns/_discord.png",
            order: 3,
          },
        ],
      });

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["stream", streamId] });
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      
      // Reset form and close dialog
      setFlowName("");
      setIsOpen(false);
      onFlowCreated?.();
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowName.trim()) return;
    
    setIsSubmitting(true);
    createFlowMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default"
          className="h-8 px-4 text-[11px] text-black hover:bg-[#4c4f69]/90"
          style={{
            backgroundColor: getColor("Lilac Accent"),
            fontFamily: getFont("Text Primary")
          }}
        >
          <Plus className="w-2 h-2 mr-1.5" />
          Project
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="border border-white/[0.09] bg-[#010203]/80 backdrop-blur-sm"
        style={{
          backgroundColor: getColor("Glass")
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle 
              className="text-[15px]"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary")
              }}
            >
              Create New Flow
            </DialogTitle>
            <DialogDescription
              className="text-[11px]"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary")
              }}
            >
              Give your new OS configuration flow a name. You can always change this later.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6">
            <Input
              className="bg-transparent border border-white/[0.09] h-8 text-[13px]"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary")
              }}
              placeholder="Flow name"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-8 text-[11px] border-white/[0.09] hover:bg-white/[0.05]"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary")
              }}
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-8 text-[11px] text-black hover:bg-[#4c4f69]/90"
              style={{
                backgroundColor: getColor("Lilac Accent"),
                fontFamily: getFont("Text Primary")
              }}
              disabled={isSubmitting || !flowName.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Flow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};