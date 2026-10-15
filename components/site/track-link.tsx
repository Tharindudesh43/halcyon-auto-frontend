"use client";

import { trackEnquiry } from "@/lib/track";

export function TrackLink({
  carId,
  type,
  ...props
}: { carId: number; type: "whatsapp" | "call" } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackEnquiry(carId, type);
        props.onClick?.(e);
      }}
    />
  );
}
