import nextEnv from "@next/env"

const { loadEnvConfig } = nextEnv as { loadEnvConfig: (dir: string) => void }

loadEnvConfig(process.cwd())

const dryRun = process.argv.includes("--dry-run")

async function main() {
  const { resolveProductSku } = await import("../src/server/admin/products")
  const { prisma } = await import("../src/lib/prisma")
  const { queueProductSync } = await import("../src/lib/zoho")

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      zohoItemId: true,
    },
    orderBy: { createdAt: "asc" },
  })

  const missingSku = products.filter((product) => !product.sku?.trim())

  let updated = 0
  let skipped = 0

  console.log(`Scanned ${products.length} products`)
  console.log(`Found ${missingSku.length} products with missing SKUs`)
  if (dryRun) {
    console.log("Dry run — no changes will be written\n")
  }

  for (const product of missingSku) {
    const sku = await resolveProductSku(product.name)

    if (dryRun) {
      console.log(`[dry-run] ${product.id} "${product.name}" -> ${sku}`)
      updated += 1
      continue
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { sku },
    })

    if (product.zohoItemId && process.env.ZOHO_SYNC_ENABLED === "true") {
      try {
        await queueProductSync(product.id, "update")
      } catch (error) {
        console.error(`Failed to queue Zoho sync for ${product.id}:`, error)
      }
    }

    console.log(`Updated ${product.id} "${product.name}" -> ${sku}`)
    updated += 1
  }

  skipped = products.length - missingSku.length

  console.log("\nSummary:")
  console.log(`  scanned: ${products.length}`)
  console.log(`  updated: ${updated}`)
  console.log(`  skipped: ${skipped}`)

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error("Backfill failed:", error)
  process.exitCode = 1
})
