'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Crown, Star, Heart, ShoppingBag, ArrowLeft, Minus, Plus, Shield, Truck, Award, Gem, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  rating: number
  reviews: number
  isNew: boolean
  isOnSale: boolean
  description: string
  fullDescription: string
  materials: string[]
  origin: string
  dimensions: string
  weight: string
  careInstructions: string[]
  shippingInfo: string
  returnPolicy: string
}

interface Review {
  id: number
  name: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = parseInt(params.id as string)
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<any[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState('description')

  // Detailed product data with multiple images
  const product: Product = {
    id: productId,
    name: "Royal Gold Adinkra Necklace",
    price: 899,
    originalPrice: 1199,
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop&crop=center"
    ],
    category: "necklaces",
    rating: 4.9,
    reviews: 124,
    isNew: true,
    isOnSale: true,
    description: "Handcrafted gold necklace featuring traditional Adinkra symbols representing wisdom and strength.",
    fullDescription: "This exquisite Royal Gold Adinkra Necklace is a masterpiece of African craftsmanship, featuring intricate Adinkra symbols that have been passed down through generations. Each symbol carries deep meaning and cultural significance, making this piece not just jewelry, but a story of heritage and wisdom. Crafted by master artisans in Ghana using traditional techniques, this necklace represents the perfect fusion of ancient wisdom and modern elegance.",
    materials: ["24k Gold", "Traditional Adinkra Symbols", "Hand-forged", "Ethically sourced"],
    origin: "Ghana",
    dimensions: "Length: 18 inches, Pendant: 2.5 x 1.8 inches",
    weight: "45 grams",
    careInstructions: [
      "Store in a dry, cool place away from direct sunlight",
      "Clean gently with a soft cloth",
      "Avoid contact with perfumes and lotions",
      "Professional cleaning recommended annually"
    ],
    shippingInfo: "Free worldwide shipping. Express delivery available.",
    returnPolicy: "30-day return policy. Full refund if not satisfied."
  }

  const reviews: Review[] = [
    {
      id: 1,
      name: "Aisha Johnson",
      rating: 5,
      comment: "Absolutely stunning piece! The craftsmanship is incredible and the Adinkra symbols are beautifully detailed. I receive compliments every time I wear it.",
      date: "2024-01-15",
      verified: true
    },
    {
      id: 2,
      name: "Kwame Asante",
      rating: 5,
      comment: "This necklace represents my heritage beautifully. The quality is exceptional and it's clear that it was made with love and respect for tradition.",
      date: "2024-01-10",
      verified: true
    },
    {
      id: 3,
      name: "Sarah Williams",
      rating: 4,
      comment: "Beautiful piece with rich cultural significance. The gold quality is excellent and the necklace feels substantial and well-made.",
      date: "2024-01-08",
      verified: true
    }
  ]

  const relatedProducts = [
    {
      id: 2,
      name: "Emerald Heritage Ring",
      price: 599,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop&crop=center",
      rating: 4.8
    },
    {
      id: 3,
      name: "Bronze Warrior Bracelet",
      price: 399,
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop&crop=center",
      rating: 4.7
    },
    {
      id: 4,
      name: "Ivory Tribal Earrings",
      price: 299,
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop&crop=center",
      rating: 4.6
    }
  ]

  // Cart and Favorites functions
  const addToCart = () => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity
      }])
    }
  }

  const toggleFavorite = () => {
    setFavorites(prev => 
      prev.includes(product.id) 
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id]
    )
  }

  // Load cart and favorites from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('tac-cart')
    const savedFavorites = localStorage.getItem('tac-favorites')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error)
      }
    }
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error)
      }
    }
  }, [])

  // Save cart and favorites to localStorage
  useEffect(() => {
    localStorage.setItem('tac-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('tac-favorites', JSON.stringify(favorites))
  }, [favorites])

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
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
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
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/products" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Products</span>
            </Link>
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-muted/20">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    New
                  </span>
                )}
                {product.isOnSale && (
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Sale
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-primary' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Product Title and Rating */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold luxury-heading mb-4">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>
              <p className="text-lg text-muted-foreground luxury-text">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-primary">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-2xl text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.isOnSale && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Save ${product.originalPrice! - product.price}
                </span>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  className="afro-button flex-1 text-lg py-6"
                  onClick={addToCart}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-14 w-14"
                  onClick={toggleFavorite}
                >
                  <Heart 
                    className={`h-6 w-6 ${
                      favorites.includes(product.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                <span className="text-sm">Secure Checkout</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-gold" />
                <span className="text-sm">Authentic</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gem className="h-5 w-5 text-purple-500" />
                <span className="text-sm">Handcrafted</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {[
                { id: 'description', name: 'Description' },
                { id: 'details', name: 'Details' },
                { id: 'reviews', name: 'Reviews' },
                { id: 'shipping', name: 'Shipping & Returns' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.fullDescription}
                </p>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Materials:</span>
                      <span>{product.materials.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Origin:</span>
                      <span>{product.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span>{product.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>{product.weight}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Care Instructions</h3>
                  <ul className="space-y-2">
                    {product.careInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Sparkles className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Customer Reviews</h3>
                  <Button className="afro-button">Write a Review</Button>
                </div>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{review.name}</span>
                            {review.verified && (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-2">
                              {review.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                  <p className="text-muted-foreground mb-4">{product.shippingInfo}</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Standard shipping: 5-7 business days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Express shipping: 2-3 business days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">Insured and tracked delivery</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Return Policy</h3>
                  <p className="text-muted-foreground mb-4">{product.returnPolicy}</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-gold" />
                      <span className="text-sm">Full refund within 30 days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gem className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Free return shipping</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="text-sm">Exchange for different size</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold luxury-heading mb-8 text-center">
            You Might Also Like
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct, index) => (
              <motion.div
                key={relatedProduct.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <Card className="afro-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="luxury-heading text-lg group-hover:text-primary transition-colors">
                      {relatedProduct.name}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        ${relatedProduct.price}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-muted-foreground">
                          {relatedProduct.rating}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="afro-button w-full" asChild>
                      <Link href={`/products/${relatedProduct.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}