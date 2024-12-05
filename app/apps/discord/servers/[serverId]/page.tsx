// app/apps/discord/servers/[serverId]/page.tsx

interface ServerPageProps {
  serverId: string;
  // EVOLVED: Added onChannelSelect and activeChannelId
  onChannelSelect: (channelId: string) => void;
  activeChannelId: string | null;
}

// EVOLVED: Destructure all props
const ServerPage = ({
  serverId,
  onChannelSelect,
  activeChannelId,
}: ServerPageProps) => {
  return <div className="text-white/75">Server Page for server {serverId}</div>;
};

export default ServerPage;
