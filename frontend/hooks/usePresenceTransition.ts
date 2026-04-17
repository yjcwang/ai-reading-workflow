"use client";

import { useEffect, useState } from "react";

type Options = {
  open: boolean;
  exitMs: number;
};

type PresenceTransition = {
  shouldRender: boolean;
  visible: boolean;
};

export function usePresenceTransition({
  open,
  exitMs,
}: Options): PresenceTransition {
  const [shouldRender, setShouldRender] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setVisible(false);

      let firstFrame = 0;
      let secondFrame = 0;

      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          setVisible(true);
        });
      });

      return () => {
        cancelAnimationFrame(firstFrame);
        cancelAnimationFrame(secondFrame);
      };
    }

    setVisible(false);
    const timeoutId = window.setTimeout(() => {
      setShouldRender(false);
    }, exitMs);

    return () => window.clearTimeout(timeoutId);
  }, [exitMs, open]);

  return {
    shouldRender,
    visible,
  };
}
