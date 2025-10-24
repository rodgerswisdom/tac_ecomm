'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ShoppingBag, Crown, ArrowLeft, Trash2, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

// Mock data for demonstration - in a real app, this would come from an API
const mockProducts = [
  {
    id: 1,
    name: "Royal Gold Adinkra Necklace",
    price: 899,
    originalPrice: 1199,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop&crop=center",
    rating: 4.9,
    reviews: 89
  },
  {
    id: 2,
    name: "Emerald Heritage Ring",
    price: 599,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop&crop=center",
    rating: 4.8,
    reviews: 45
  },
  {
    id: 3,
    name: "Bronze Warrior Bracelet",
    price: 399,
    originalPrice: 549,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop&crop=center",
    rating: 4.7,
    reviews: 12
  }
]

export default function FavoritesPage() {
  const { favorites, toggleFavorite, addToCart, getCartItemCount } = useCart()
  
  // Get favorite products from mock data
  const favoriteProducts = mockProducts.filter(product => favorites.includes(product.id))

  const addToCartFromFavorites = (product: typeof mockProducts[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image
    })
    alert(`${product.name} added to cart!`)
  }

  const clearAllFavorites = () => {
    favoriteProducts.forEach(product => {
      toggleFavorite(product.id)
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold luxury-heading afro-text-gradient">
              TAC Jewellery
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/favorites">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            </Button>
            <Button className="afro-button" asChild>
              <Link href="/auth/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" asChild>
              <Link href="/products" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Products</span>
              </Link>
            </Button>
            {favoriteProducts.length > 0 && (
              <Button variant="outline" onClick={clearAllFavorites} className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Favorites
              </Button>
            )}
          </div>
          <h1 className="text-4xl font-bold luxury-heading">
            My <span className="afro-text-gradient">Favorites</span>
          </h1>
          {favoriteProducts.length > 0 && (
            <p className="text-lg text-muted-foreground mt-2">
              {favoriteProducts.length} item{favoriteProducts.length !== 1 ? 's' : ''} in your favorites
            </p>
          )}
        </motion.div>

        {favoriteProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold luxury-heading mb-4">No favorites yet!</h2>
            <p className="text-muted-foreground mb-8">
              Explore our collection and add items you love to your wishlist.
            </p>
            <Link href="/products">
              <Button className="afro-button">
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {favoriteProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="afro-card overflow-hidden h-full">
                  <div className="relative">
                    <Link href={`/products/${product.id}`}>
                      <div className="aspect-[3/4] relative overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    </Link>
                    
                    {/* Wishlist Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-background/80 hover:bg-background text-red-500 hover:text-red-600"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg luxury-heading group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/products/${product.id}`}>
                        {product.name}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews})
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold afro-text-gradient">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button className="w-full afro-button" onClick={() => addToCartFromFavorites(product)}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}