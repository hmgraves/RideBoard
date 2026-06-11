"use client";

import { useSyncExternalStore } from "react";

type LocalPublishedTimeProps = {
  isoDate: string;
};

export function LocalPublishedTime({ isoDate }: LocalPublishedTimeProps) {
  const localTime = useSyncExternalStore(
    subscribe,
    () => formatLocalTime(isoDate),
    () => new Date(isoDate).toISOString()
  );

  return <time dateTime={isoDate}>{localTime}</time>;
}

function subscribe() {
  return () => {};
}

function formatLocalTime(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(isoDate));
}
