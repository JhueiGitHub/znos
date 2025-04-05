import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@dis/components/ui/sheet";
import { Button } from "@dis/components/ui/button";
import NavigationSidebar from "@dis/components/navigation/navigation-sidebar";
import { ServerSidebar } from "@dis/components/server/server-sidebar";

export const MobileToggle = ({ serverId }: { serverId: string }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0">
        <div className="w-[72px]">
          <NavigationSidebar
            onServerSelect={function (serverId: string): void {
              throw new Error("Function not implemented.");
            }}
          />
        </div>
        <ServerSidebar
          serverId={serverId}
          onChannelSelect={function (channelId: string): void {
            throw new Error("Function not implemented.");
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
