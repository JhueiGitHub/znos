"use client";

// PRESERVED: Base imports
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useModal } from "@os/hooks/use-modal-store";

// PRESERVED: Component imports with evolved styling
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@dis/components/ui/form";
import { Input } from "@dis/components/ui/input";
import { Button } from "@dis/components/ui/button";
import { FileUpload } from "@dis/components/file-upload";

// PRESERVED: Form schema
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  imageUrl: z.string().min(1, {
    message: "Server image is required.",
  }),
});

// EVOLVED: Component with Zenith styling
export const CreateServerModal = ({
  onServerCreated,
}: {
  onServerCreated: (id: string) => void;
}) => {
  // PRESERVED: Hooks and state
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "createServer";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // PRESERVED: Form submission logic
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/servers", values);
      onServerCreated(response.data.id);
      handleClose();
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // EVOLVED: Return with fixed Zenith styling
  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#010203] border border-[#29292981] rounded-2xl">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold text-[#CCCCCC]">
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-[#CCCCCC81]">
            Give your server a personality with a name and an image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="serverImage"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-[#CCCCCC81]">
                      Server Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-[#01020330] border border-[#29292981] focus-visible:ring-0 text-[#CCCCCC] focus-visible:ring-offset-0"
                        placeholder="Enter server name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[#CCCCCC81]" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-[#01020330] px-6 py-4">
              <Button
                variant="primary"
                disabled={isLoading}
                className="bg-[#4C4F69] hover:bg-[#4C4F6981] text-[#CCCCCC] transition"
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
