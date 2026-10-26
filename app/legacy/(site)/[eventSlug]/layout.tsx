import { Suspense } from "react";
import { EventLayoutContent } from "./layout-content";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventLayoutContent eventSlug={eventSlug}>{children}</EventLayoutContent>
    </Suspense>
  );
}
