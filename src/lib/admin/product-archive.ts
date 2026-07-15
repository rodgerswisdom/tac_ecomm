import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

type ArchiveClient = Prisma.TransactionClient | typeof prisma

export function archiveFieldsForStock(stock: number, isDraft: boolean) {
  if (isDraft || stock > 0) {
    return {}
  }

  return {
    isArchived: true,
    isActive: false,
  }
}

export async function syncProductArchiveForStock(
  productId: string,
  client: ArchiveClient = prisma
) {
  const product = await client.product.findUnique({
    where: { id: productId },
    select: { stock: true, isDraft: true, isArchived: true, isActive: true },
  })

  if (!product || product.isDraft) {
    return
  }

  const archiveFields = archiveFieldsForStock(product.stock, product.isDraft)
  if (!archiveFields.isArchived) {
    return
  }

  if (product.isArchived && product.isActive === false) {
    return
  }

  await client.product.update({
    where: { id: productId },
    data: archiveFields,
  })
}
