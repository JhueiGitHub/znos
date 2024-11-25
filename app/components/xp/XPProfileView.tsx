// app/components/xp/XPProfileView.tsx
import { motion } from "framer-motion";
import { useStyles } from "@os/hooks/useStyles";
import { Card } from "@/components/ui/card";
import { XPProfile } from "@/app/types/xp";

interface XPProfileViewProps {
  profile: XPProfile;
}

export const XPProfileView = ({ profile }: XPProfileViewProps) => {
  const { getColor, getFont } = useStyles();

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-6">
          <div
            className="w-24 h-24 rounded-full border overflow-hidden"
            style={{ borderColor: getColor("Brd") }}
          >
            <img
              src={profile.customImageUrl || "/media/default-avatar.png"}
              alt={profile.displayName || "Profile"}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold mb-2"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              {profile.displayName}
            </h1>
            <p
              className="text-sm"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              {profile.bio}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        <StatCard
          label="Total Downloads"
          value={profile.totalDownloads}
          getColor={getColor}
          getFont={getFont}
        />
        <StatCard
          label="Design Systems"
          value={profile.designSystemsPublished}
          getColor={getColor}
          getFont={getFont}
        />
        <StatCard
          label="Total Earned"
          value={`$${profile.totalEarned}`}
          getColor={getColor}
          getFont={getFont}
        />
      </motion.div>

      {/* Placeholder for Publications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          Published Design Systems
        </h2>
        <div
          className="p-8 border rounded-lg text-center"
          style={{
            borderColor: getColor("Brd"),
            backgroundColor: getColor("Glass"),
          }}
        >
          <p
            className="text-sm"
            style={{
              color: getColor("Text Secondary (Bd)"),
              fontFamily: getFont("Text Secondary"),
            }}
          >
            No design systems published yet
          </p>
        </div>
      </motion.div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number | string;
  getColor: (name: string) => string;
  getFont: (name: string) => string;
}

const StatCard = ({ label, value, getColor, getFont }: StatCardProps) => (
  <Card
    className="p-4"
    style={{
      backgroundColor: getColor("Glass"),
      borderColor: getColor("Brd"),
    }}
  >
    <div
      className="text-sm mb-1"
      style={{
        color: getColor("Text Secondary (Bd)"),
        fontFamily: getFont("Text Secondary"),
      }}
    >
      {label}
    </div>
    <div
      className="text-2xl font-semibold"
      style={{
        color: getColor("Text Primary (Hd)"),
        fontFamily: getFont("Text Primary"),
      }}
    >
      {value}
    </div>
  </Card>
);