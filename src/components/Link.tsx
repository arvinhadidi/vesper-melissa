import NextLink from "next/link";
import type { ComponentProps } from "react";

// Site-wide Link with viewport prefetch OFF. next/link's default prefetch fired
// 45-200 RSC requests per page view (one per visible link, per segment), which
// pushed the shared Vercel Hobby account past 1M requests/month and paused the
// account (Nov 2026). Pass prefetch explicitly to opt a single link back in.
export default function Link({ prefetch = false, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch} {...props} />;
}
