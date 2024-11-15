import Image from "next/image";

interface AppIconProps {
  src: string;
  alt: string;
}

const AppIcon: React.FC<AppIconProps> = ({ src, alt }) => {
  return (
    <Image src={src} alt={alt} width={40} height={40} className="rounded-lg" />
  );
};

export default AppIcon;
