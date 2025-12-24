"use client";

import { useState } from "react";
import Image from "next/image";
import { X, GitCompare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductCardData } from "@/components/ProductCard";

interface ProductComparisonProps {
  selectedProducts: ProductCardData[];
  onRemove: (productId: number) => void;
  onClear: () => void;
}

export function ProductComparison({
  selectedProducts,
  onRemove,
  onClear,
}: ProductComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedProducts.length === 0) return null;

  return (
    <>
      {/* Comparison Bar - Sticky Bottom */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-teal/20 bg-white/95 backdrop-blur-md shadow-lg"
      >
        <div className="gallery-container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-brand-teal" />
                <span className="font-semibold text-brand-umber">
                  {selectedProducts.length} product
                  {selectedProducts.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex gap-2">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="relative h-12 w-12 overflow-hidden rounded border border-brand-teal/20"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                    <button
                      onClick={() => onRemove(product.id)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-coral text-white"
                      aria-label={`Remove ${product.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                size="sm"
              >
                {isExpanded ? "Collapse" : "Compare"}
              </Button>
              <Button onClick={onClear} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comparison Table - Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed bottom-16 left-0 right-0 z-40 max-h-[60vh] overflow-y-auto border-t border-brand-teal/20 bg-white shadow-xl"
          >
            <div className="gallery-container py-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-brand-teal/20 p-4 text-left font-semibold text-brand-umber">
                        Product
                      </th>
                      {selectedProducts.map((product) => (
                        <th
                          key={product.id}
                          className="border-b border-brand-teal/20 p-4 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative h-24 w-24 overflow-hidden rounded border border-brand-teal/20">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                            </div>
                            <span className="text-sm font-medium text-brand-umber">
                              {product.name}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-brand-teal/10 p-4 font-medium text-brand-umber/70">
                        Price
                      </td>
                      {selectedProducts.map((product) => (
                        <td
                          key={product.id}
                          className="border-b border-brand-teal/10 p-4 text-center"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-brand-coral">
                              KES {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-brand-umber/40 line-through">
                                KES {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border-b border-brand-teal/10 p-4 font-medium text-brand-umber/70">
                        Materials
                      </td>
                      {selectedProducts.map((product) => (
                        <td
                          key={product.id}
                          className="border-b border-brand-teal/10 p-4 text-center"
                        >
                          <div className="flex flex-wrap justify-center gap-1">
                            {product.materials.map((material) => (
                              <span
                                key={material}
                                className="rounded-full bg-brand-jade/40 px-2 py-0.5 text-xs text-brand-umber/80"
                              >
                                {material}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border-b border-brand-teal/10 p-4 font-medium text-brand-umber/70">
                        Origin
                      </td>
                      {selectedProducts.map((product) => (
                        <td
                          key={product.id}
                          className="border-b border-brand-teal/10 p-4 text-center text-sm text-brand-umber/80"
                        >
                          {product.origin}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border-b border-brand-teal/10 p-4 font-medium text-brand-umber/70">
                        Category
                      </td>
                      {selectedProducts.map((product) => (
                        <td
                          key={product.id}
                          className="border-b border-brand-teal/10 p-4 text-center text-sm text-brand-umber/80 capitalize"
                        >
                          {product.category}
                        </td>
                      ))}
                    </tr>
                    {selectedProducts.some((p) => p.rating) && (
                      <tr>
                        <td className="p-4 font-medium text-brand-umber/70">
                          Rating
                        </td>
                        {selectedProducts.map((product) => (
                          <td
                            key={product.id}
                            className="p-4 text-center text-sm text-brand-umber/80"
                          >
                            {product.rating ? (
                              <div className="flex items-center justify-center gap-1">
                                <span className="font-semibold">
                                  {product.rating.toFixed(1)}
                                </span>
                                <span className="text-brand-gold">★</span>
                                {product.reviewCount && (
                                  <span className="text-xs text-brand-umber/60">
                                    ({product.reviewCount})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-brand-umber/40">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

