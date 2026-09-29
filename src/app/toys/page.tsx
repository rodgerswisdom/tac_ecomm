import { permanentRedirect } from "next/navigation"

/** Toys have been retired from the storefront; send old links to the main shop. */
export default function ToysPage() {
  permanentRedirect("/collections")
}
