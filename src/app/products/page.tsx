'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Crown, Search, Filter, Star, Heart, ShoppingBag, Sparkles, Gem, Award, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CategoryDropdown, SortDropdown } from '@/components/ui/custom-dropdown'

// Cart and Favorites Context
interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviews: number
  isNew: boolean
  isOnSale: boolean
  description: string
  materials: string[]
  origin: string
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const { favorites, addToCart, toggleFavorite, getCartItemCount } = useCart()

  // Real African jewellery products with actual images
  const products: Product[] = [
    {
      id: 1,
      name: "Royal Gold Adinkra Necklace",
      price: 899,
      originalPrice: 1199,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=600&fit=crop&crop=center",
      category: "necklaces",
      rating: 4.9,
      reviews: 124,
      isNew: true,
      isOnSale: true,
      description: "Handcrafted gold necklace featuring traditional Adinkra symbols representing wisdom and strength.",
      materials: ["24k Gold", "Traditional Adinkra Symbols"],
      origin: "Ghana"
    },
    {
      id: 2,
      name: "Emerald Heritage Ring",
      price: 599,
      originalPrice: 799,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=600&fit=crop&crop=center",
      category: "rings",
      rating: 4.8,
      reviews: 89,
      isNew: false,
      isOnSale: true,
      description: "Stunning emerald ring with intricate African tribal patterns, symbolizing prosperity and growth.",
      materials: ["Emerald", "18k Gold", "Tribal Patterns"],
      origin: "Ethiopia"
    },
    {
      id: 3,
      name: "Bronze Warrior Bracelet",
      price: 399,
      originalPrice: 549,
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=600&fit=crop&crop=center",
      category: "bracelets",
      rating: 4.7,
      reviews: 67,
      isNew: true,
      isOnSale: false,
      description: "Bold bronze bracelet inspired by ancient African warrior traditions and modern elegance.",
      materials: ["Bronze", "Hand-forged", "Warrior Symbols"],
      origin: "Nigeria"
    },
    {
      id: 4,
      name: "Ivory Tribal Earrings",
      price: 299,
      originalPrice: 399,
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=600&fit=crop&crop=center",
      category: "earrings",
      rating: 4.6,
      reviews: 45,
      isNew: false,
      isOnSale: true,
      description: "Elegant ivory earrings with traditional tribal carvings, representing cultural heritage.",
      materials: ["Ivory", "Traditional Carvings", "Gold Accents"],
      origin: "Kenya"
    },
    {
      id: 5,
      name: "Copper Ankh Pendant",
      price: 199,
      originalPrice: 299,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=600&fit=crop&crop=center",
      category: "necklaces",
      rating: 4.8,
      reviews: 78,
      isNew: true,
      isOnSale: false,
      description: "Sacred Ankh pendant in copper, symbolizing eternal life and divine protection.",
      materials: ["Copper", "Sacred Ankh Symbol", "Hand-polished"],
      origin: "Egypt"
    },
    {
      id: 6,
      name: "Gold Maasai Bead Set",
      price: 1299,
      originalPrice: 1599,
      image: "https://images.unsplash.com/photo-1617038220319-276d0f6d90a0?w=500&h=600&fit=crop&crop=center",
      category: "sets",
      rating: 4.9,
      reviews: 156,
      isNew: false,
      isOnSale: true,
      description: "Complete Maasai-inspired jewellery set with traditional beadwork and gold accents.",
      materials: ["Gold", "Traditional Beads", "Maasai Patterns"],
      origin: "Tanzania"
    },
    {
      id: 7,
      name: "Silver Berber Ring",
      price: 349,
      originalPrice: 449,
      image: "https://images.unsplash.com/photo-1603561596112-db0b3b0b5a8b?w=500&h=600&fit=crop&crop=center",
      category: "rings",
      rating: 4.7,
      reviews: 92,
      isNew: true,
      isOnSale: false,
      description: "Intricate Berber silver ring with geometric patterns representing ancient wisdom.",
      materials: ["Sterling Silver", "Berber Patterns", "Hand-engraved"],
      origin: "Morocco"
    },
    {
      id: 8,
      name: "Wooden Tribal Bracelet",
      price: 149,
      originalPrice: 199,
      image: "https://images.unsplash.com/photo-1617038220319-276d0f6d90a0?w=500&h=600&fit=crop&crop=center",
      category: "bracelets",
      rating: 4.5,
      reviews: 34,
      isNew: false,
      isOnSale: true,
      description: "Hand-carved wooden bracelet with traditional African tribal motifs and natural finish.",
      materials: ["Ebony Wood", "Tribal Carvings", "Natural Finish"],
      origin: "Congo"
    }
  ]

  const categories = [
    { id: 'all', name: 'All Products', icon: <Crown className="h-4 w-4" /> },
    { id: 'necklaces', name: 'Necklaces', icon: <Gem className="h-4 w-4" /> },
    { id: 'rings', name: 'Rings', icon: <Award className="h-4 w-4" /> },
    { id: 'bracelets', name: 'Bracelets', icon: <Zap className="h-4 w-4" /> },
    { id: 'earrings', name: 'Earrings', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'sets', name: 'Sets', icon: <Crown className="h-4 w-4" /> }
  ]

  const sortOptions = [
    { id: 'featured', name: 'Featured' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'newest', name: 'Newest' },
    { id: 'rating', name: 'Highest Rated' }
  ]

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'newest':
          return b.isNew ? 1 : -1
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

  const addToCartFromProducts = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image
    })
    alert(`${product.name} added to cart!`)
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

      {/* Header */}
      <div className="bg-gradient-to-r from-gold/10 via-emerald/5 to-bronze/10 py-16 relative overflow-hidden">
        <div className="absolute inset-0 afro-pattern-stars opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center space-x-2 mb-6"
            >
              <Gem className="h-8 w-8 text-emerald-500" />
              <span className="text-emerald-600 font-semibold tracking-wide uppercase text-sm">Our Collection</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold luxury-heading mb-6">
              <span className="afro-text-gradient">African Jewellery</span>
              <br />
              <span className="text-foreground">Masterpieces</span>
            </h1>
            <p className="text-xl text-muted-foreground luxury-text max-w-3xl mx-auto">
              Discover our exquisite collection of handcrafted African jewellery, each piece telling a unique story of heritage, 
              culture, and timeless elegance from master artisans across the continent.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for jewellery, materials, or origin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-4">
            <CategoryDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="min-w-[150px]"
            />

            <SortDropdown
              value={sortBy}
              onChange={setSortBy}
              className="min-w-[180px]"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Card className="afro-card overflow-hidden group hover:shadow-2xl transition-all duration-500 group-hover:scale-105 relative">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      New
                    </span>
                  )}
                  {product.isOnSale && (
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Sale
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors ${
                      favorites.includes(product.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-muted-foreground hover:text-red-500'
                    }`} 
                  />
                </Button>

                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <CardHeader className="relative z-10">
                  <CardTitle className="luxury-heading text-lg group-hover:text-primary transition-colors">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="luxury-text text-sm">
                    {product.description.substring(0, 80)}...
                  </CardDescription>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>Origin: {product.origin}</span>
                    <span>•</span>
                    <span>{product.materials[0]}</span>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-muted-foreground">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                        <Button 
                          className="afro-button flex-1 group"
                          onClick={() => addToCartFromProducts(product)}
                        >
                          <ShoppingBag className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                          <span className="group-hover:scale-105 transition-transform">Add to Cart</span>
                        </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="group"
                      asChild
                    >
                      <Link href={`/products/${product.id}`}>
                        <Crown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Crown className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSortBy('featured')
              }}
              className="afro-button"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}