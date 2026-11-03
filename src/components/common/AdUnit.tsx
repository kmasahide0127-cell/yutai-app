"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, AdSenseScript } from "@/components/common/AdSenseScript";

interface Props {
  slot?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

export default function AdUnit({ slot, format = "auto", className = "" }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adsbygoogle: unknown[] = (window as any).adsbygoogle ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle = adsbygoogle;
      adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  return (
    <div className={`overflow-hidden ${className}`}>
      <AdSenseScript />
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot ?? ""}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
