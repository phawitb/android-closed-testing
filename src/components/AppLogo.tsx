import Image from "next/image";
import { cn } from "./ui";

/** The app's icon mark — same image used for the favicon and PWA icons. */
export function AppLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/icon-192.png"
      alt=""
      width={192}
      height={192}
      className={cn("rounded-xl", className)}
    />
  );
}
