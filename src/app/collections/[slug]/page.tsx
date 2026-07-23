import { redirect } from "next/navigation"
import { getCollectionsHref } from "@/lib/collections-url"

interface CollectionSlugRedirectProps {
  params: Promise<{ slug: string }>
}

/** Legacy per-category collection pages → unified /collections shop page. */
export default async function CollectionSlugRedirect({ params }: CollectionSlugRedirectProps) {
  const { slug } = await params
  redirect(getCollectionsHref(slug))
}
