'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Star, Truck, Shield, Heart, Crown, Sparkles, Gem, Zap, Award, X, Plus, Minus, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

// Mock product data for the landing page
const featuredProducts = [
  {
    id: 1,
    name: "Royal Gold Adinkra Necklace",
    price: 899,
    originalPrice: 1199,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=600&fit=crop&crop=center",
    rating: 4.9,
    reviews: 89,
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
    rating: 4.8,
    reviews: 45,
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
    rating: 4.7,
    reviews: 67,
    description: "Bold bronze bracelet inspired by ancient African warrior traditions and modern elegance.",
    materials: ["Bronze", "Hand-forged", "Warrior Symbols"],
    origin: "Nigeria"
  }
]

export default function HomePage() {
  const { favorites, addToCart, toggleFavorite, getCartItemCount } = useCart()
  const [selectedProduct, setSelectedProduct] = useState<typeof featuredProducts[0] | null>(null)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = (product: typeof featuredProducts[0]) => {
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* African Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-emerald/5 to-bronze/10"></div>
        <div className="absolute top-0 left-0 w-full h-full afro-pattern-dots"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/90 backdrop-blur-md border-b border-border/50 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-3"
          >
            <div className="relative">
              <Crown className="h-8 w-8 text-primary" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </motion.div>
            </div>
            <span className="text-2xl font-bold luxury-heading afro-text-gradient">
              TAC Jewellery
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex items-center space-x-8"
          >
            <Link href="/products" className="text-foreground hover:text-primary transition-colors relative group">
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/categories" className="text-foreground hover:text-primary transition-colors relative group">
              Categories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center space-x-4"
          >
            <Button variant="ghost" size="icon" className="relative group" asChild>
              <Link href="/favorites">
                <Heart className="h-5 w-5 group-hover:text-red-500 transition-colors" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative group" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5 group-hover:text-primary transition-colors" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            </Button>
            <Button className="afro-button group" asChild>
              <Link href="/auth/signin">
                <span className="group-hover:scale-105 transition-transform">Sign In</span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section with Background Carousel */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          {/* Sliding Carousel Background */}
          <div className="absolute inset-0 flex">
            {/* First Set */}
            <motion.div
              animate={{ x: [0, -100] }}
              transition={{ 
                duration: 30,
                repeat: Infinity,
                ease: "linear"
              }}
              className="flex space-x-8 min-w-max"
            >
              {/* Maasai Shuka 1 */}
              <div className="relative w-96 h-full">
                <Image
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=800&fit=crop&crop=center"
                  alt="Traditional Maasai Shuka"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30"></div>
              </div>

              {/* Bronze Ring 1 */}
              <div className="relative w-96 h-full">
                <Image
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=800&fit=crop&crop=center"
                  alt="Bronze Heritage Ring"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-yellow-600/30"></div>
              </div>

              {/* Maasai Shuka 2 */}
              <div className="relative w-96 h-full">
                <Image
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=800&fit=crop&crop=center"
                  alt="Blue Maasai Shuka"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-500/30"></div>
              </div>

              {/* Bronze Ring 2 */}
              <div className="relative w-96 h-full">
                <Image
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=800&fit=crop&crop=center"
                  alt="Copper Warrior Ring"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-copper/30 to-bronze/30"></div>
              </div>

              {/* Additional Maasai Shuka */}
              <div className="relative w-96 h-full">
                <Image
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=800&fit=crop&crop=center"
                  alt="Traditional Maasai Shuka"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30"></div>
              </div>
            </motion.div>

            {/* Second Set (Duplicate for seamless loop) */}
            <motion.div
              animate={{ x: [0, -100] }}
              transition={{ 
                duration: 30,
                repeat: Infinity,
                ease: "linear"
              }}
              className="flex space-x-8 min-w-max"
            >
              {/* Maasai Shuka 1 */}
              <div className="relative w-96 h-full">
                <Image
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=800&fit=crop&crop=center"
                  alt="Traditional Maasai Shuka"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30"></div>
              </div>

              {/* Bronze Ring 1 */}
              <div className="relative w-96 h-full">
                <Image
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=800&fit=crop&crop=center"
                  alt="Bronze Heritage Ring"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-yellow-600/30"></div>
              </div>

              {/* Maasai Shuka 2 */}
              <div className="relative w-96 h-full">
                <Image
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=800&fit=crop&crop=center"
                  alt="Blue Maasai Shuka"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-500/30"></div>
              </div>

              {/* Bronze Ring 2 */}
              <div className="relative w-96 h-full">
                <Image
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=800&fit=crop&crop=center"
                  alt="Copper Warrior Ring"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-copper/30 to-bronze/30"></div>
              </div>

              {/* Additional Maasai Shuka */}
              <div className="relative w-96 h-full">
                <Image
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=800&fit=crop&crop=center"
                  alt="Traditional Maasai Shuka"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30"></div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Edge Blending with Increasing Opacity */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 via-background/60 via-background/40 via-background/20 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 via-background/60 via-background/40 via-background/20 to-transparent z-10"></div>
          
          {/* African Pattern Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-emerald/3 to-bronze/5 z-20"></div>
          <div className="absolute top-0 left-0 w-full h-full afro-pattern-stars opacity-20 z-20"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-30">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center space-x-2 mb-6"
              >
                <Gem className="h-6 w-6 text-emerald-500" />
                <span className="text-emerald-600 font-semibold tracking-wide uppercase text-sm">Authentic African Heritage</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold luxury-heading mb-6 leading-tight">
                <span className="afro-text-gradient">African</span>
                <br />
                <span className="text-foreground">Jewellery</span>
                <br />
                <span className="text-2xl md:text-3xl text-muted-foreground font-normal">Redefined</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground luxury-text mb-8 max-w-lg">
                Discover our exclusive collection of handcrafted African jewellery that tells stories of heritage, 
                celebrates culture, and embodies timeless elegance.
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button size="lg" className="afro-button text-lg px-8 py-6 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-emerald/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform relative z-10" />
                  <span className="group-hover:scale-105 transition-transform relative z-10">Discover Your Heritage ✨</span>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 group border-2 hover:bg-primary hover:text-primary-foreground transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Award className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform relative z-10" />
                  <span className="group-hover:scale-105 transition-transform relative z-10">Meet Our Artisans 👑</span>
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center space-x-6 mt-8"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-bronze border-2 border-background"></div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">10,000+ Happy Customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold">4.9/5 Rating</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Floating Elements */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Floating Sparkles */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-4 right-4 z-20"
              >
                <Sparkles className="h-12 w-12 text-gold drop-shadow-lg" />
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-4 -left-4 w-16 h-16 bg-gold/20 rounded-full blur-xl"
              />
              <motion.div
                animate={{ 
                  y: [0, 20, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-muted/10 relative overflow-hidden">
        {/* African Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full afro-pattern-large-stars"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center justify-center space-x-2 mb-6"
            >
              <Gem className="h-8 w-8 text-emerald-500" />
              <span className="text-emerald-600 font-semibold tracking-wide uppercase text-sm">Why Choose TAC Jewellery</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold luxury-heading mb-6">
              <span className="afro-text-gradient">African Heritage</span>
              <br />
              <span className="text-foreground">Meets Modern Luxury</span>
            </h2>
            <p className="text-xl text-muted-foreground luxury-text max-w-3xl mx-auto">
              Every piece tells a story of African culture, crafted with love by master artisans 
              and designed for the modern world.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Crown className="h-12 w-12 text-primary" />,
                title: "Master Artisans",
                description: "Handcrafted by skilled African artisans using traditional techniques passed down through generations, ensuring each piece is unique and authentic.",
                pattern: "M20 0L25 15L40 20L25 25L20 40L15 25L0 20L15 15z"
              },
              {
                icon: <Gem className="h-12 w-12 text-emerald-500" />,
                title: "Ethical Materials",
                description: "Sourced responsibly from African mines and local communities, supporting fair trade and sustainable practices while delivering exceptional quality.",
                pattern: "M15 0L18 12L30 15L18 18L15 30L12 18L0 15L12 12z"
              },
              {
                icon: <Award className="h-12 w-12 text-bronze" />,
                title: "Global Excellence",
                description: "From our workshops in Africa to your doorstep worldwide, we ensure premium quality and authentic African craftsmanship in every piece.",
                pattern: "M30 0L35 20L55 25L35 30L30 50L25 30L5 25L25 20z"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="afro-card h-full text-center p-8 hover:shadow-2xl transition-all duration-500 group-hover:scale-105 relative overflow-hidden">
                  {/* African Pattern Background */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <div className="absolute inset-0 afro-pattern-small-stars"></div>
                  </div>
                  
                  <CardHeader className="relative z-10">
                    <motion.div 
                      className="flex justify-center mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all">
                        {feature.icon}
                      </div>
                    </motion.div>
                    <CardTitle className="text-2xl luxury-heading group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-lg luxury-text leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-gold/10 via-emerald/5 to-bronze/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 afro-pattern-small-dots"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold luxury-heading mb-4">
                  Ready to Discover Your <span className="afro-text-gradient">Perfect Piece</span>?
                </h3>
                <p className="text-lg text-muted-foreground luxury-text mb-8 max-w-2xl mx-auto">
                  Join thousands of customers who have found their perfect African jewellery piece. 
                  Start your journey today and embrace the beauty of African heritage.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="afro-button text-lg px-8 py-6 group">
                    <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:scale-105 transition-transform">Shop Now</span>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 group border-2 hover:bg-primary hover:text-primary-foreground transition-all">
                    <Heart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:scale-105 transition-transform">View Gallery</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden">
        {/* African Pattern Background */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 left-0 w-full h-full afro-pattern-medium-stars"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center justify-center space-x-2 mb-6"
            >
              <Sparkles className="h-8 w-8 text-gold" />
              <span className="text-gold font-semibold tracking-wide uppercase text-sm">Featured Collections</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold luxury-heading mb-6">
              <span className="afro-text-gradient">African Jewellery</span>
              <br />
              <span className="text-foreground">Masterpieces</span>
            </h2>
            <p className="text-xl text-muted-foreground luxury-text max-w-3xl mx-auto">
              Each piece is a celebration of African culture, meticulously crafted by master artisans 
              and designed to tell your unique story.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="afro-card overflow-hidden group hover:shadow-2xl transition-all duration-500 group-hover:scale-105 relative">
                  {/* African Pattern Background */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <div className="absolute inset-0 afro-pattern-small-stars"></div>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="bg-gradient-to-r from-gold to-bronze text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="aspect-square relative overflow-hidden">
            <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    
                    {/* View More Button - appears on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        onClick={() => setSelectedProduct(product)}
                        className="afro-button bg-background/90 backdrop-blur-sm hover:bg-background"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View More
                      </Button>
                    </div>
                    
                    {/* Floating Sparkles */}
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute top-4 left-4"
                    >
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  </div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="luxury-heading text-xl group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="luxury-text leading-relaxed">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-primary">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
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
                        <span className="text-sm text-muted-foreground ml-1">({product.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="afro-button flex-1 group"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingBag className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="group-hover:scale-105 transition-transform">Add to Cart</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="group"
                        onClick={() => toggleFavorite(product.id)}
                      >
                        <Heart className={`h-4 w-4 group-hover:scale-110 transition-transform ${
                          favorites.includes(product.id) ? 'text-red-500 fill-current' : ''
                        }`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button size="lg" className="afro-button text-lg px-8 py-6 group">
              <Gem className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="group-hover:scale-105 transition-transform">Explore All Collections</span>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-gold/5 via-emerald/3 to-bronze/5 relative overflow-hidden">
        {/* African Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full afro-pattern-stars"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center justify-center space-x-2 mb-6"
            >
              <Heart className="h-8 w-8 text-emerald-500" />
              <span className="text-emerald-600 font-semibold tracking-wide uppercase text-sm">Join Our Community</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold luxury-heading mb-6">
              <span className="afro-text-gradient">Stay Connected</span>
              <br />
              <span className="text-foreground">to African Heritage</span>
            </h2>
            <p className="text-xl text-muted-foreground luxury-text mb-8 max-w-2xl mx-auto">
              Be the first to discover new collections, exclusive offers, and stories from our master artisans. 
              Join our community of African culture enthusiasts.
            </p>
            
            <div className="bg-gradient-to-r from-gold/10 via-emerald/5 to-bronze/10 rounded-2xl p-8 max-w-2xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 afro-pattern-small-dots"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full px-6 py-4 rounded-xl border-2 border-gold/20 bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all"
                    />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <Sparkles className="h-5 w-5 text-gold" />
                    </motion.div>
                  </div>
                  <Button className="afro-button px-8 py-4 text-lg group">
                    <Zap className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:scale-105 transition-transform">Subscribe</span>
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  Join 10,000+ subscribers. Unsubscribe anytime. We respect your privacy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-ebony via-foreground to-ebony text-background py-16 relative overflow-hidden">
        {/* African Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full afro-pattern-large-stars"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3 mb-6"
              >
                <div className="relative">
                  <Crown className="h-10 w-10 text-gold" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  </motion.div>
                </div>
                <span className="text-2xl font-bold luxury-heading text-gold">
                  TAC Jewellery
                </span>
              </motion.div>
              <p className="text-muted-foreground luxury-text leading-relaxed mb-6">
                Celebrating the rich tapestry of African heritage through exquisite handcrafted jewellery. 
                Each piece tells a story of culture, tradition, and timeless elegance.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-bronze border-2 border-background"></div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">10,000+ Happy Customers</span>
                </div>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-6 text-gold">Collections</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/products/gold" className="hover:text-gold transition-colors flex items-center group">
                  <Gem className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Gold Heritage
                </Link></li>
                <li><Link href="/products/emerald" className="hover:text-emerald-400 transition-colors flex items-center group">
                  <Gem className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Emerald Elegance
                </Link></li>
                <li><Link href="/products/bronze" className="hover:text-bronze transition-colors flex items-center group">
                  <Gem className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Bronze Beauty
                </Link></li>
                <li><Link href="/products/limited" className="hover:text-gold transition-colors flex items-center group">
                  <Award className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Limited Edition
                </Link></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-6 text-gold">Support</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/shipping" className="hover:text-gold transition-colors flex items-center group">
                  <Truck className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Worldwide Shipping
                </Link></li>
                <li><Link href="/returns" className="hover:text-gold transition-colors flex items-center group">
                  <Shield className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Easy Returns
                </Link></li>
                <li><Link href="/size-guide" className="hover:text-gold transition-colors flex items-center group">
                  <Gem className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Size Guide
                </Link></li>
                <li><Link href="/faq" className="hover:text-gold transition-colors flex items-center group">
                  <Zap className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  FAQ
                </Link></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-6 text-gold">Connect With Us</h3>
              <p className="text-muted-foreground mb-6">
                Follow our journey and discover the stories behind each piece.
              </p>
              <div className="flex space-x-4 mb-6">
                <Button variant="ghost" size="icon" className="text-background hover:text-gold hover:bg-gold/10 transition-all group">
                  <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
                <Button variant="ghost" size="icon" className="text-background hover:text-emerald-400 hover:bg-emerald-400/10 transition-all group">
                  <Star className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
                <Button variant="ghost" size="icon" className="text-background hover:text-bronze hover:bg-bronze/10 transition-all group">
                  <Gem className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
                <Button variant="ghost" size="icon" className="text-background hover:text-gold hover:bg-gold/10 transition-all group">
                  <Crown className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
              
              <div className="bg-gradient-to-r from-gold/10 to-bronze/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Newsletter</p>
                <p className="text-xs text-muted-foreground">Get exclusive offers and cultural insights</p>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="border-t border-gold/20 mt-12 pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground text-center md:text-left">
                &copy; 2024 TAC Jewellery. All rights reserved. Celebrating African heritage worldwide.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Product Detail Popup */}
      {selectedProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-background rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold luxury-heading">
                {selectedProduct.name}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedProduct(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="relative">
                <div className="aspect-square relative overflow-hidden rounded-xl">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(selectedProduct.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                    <span className="text-muted-foreground">({selectedProduct.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-3xl font-bold text-primary">${selectedProduct.price}</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-xl text-muted-foreground line-through">${selectedProduct.originalPrice}</span>
                    )}
                    {selectedProduct.originalPrice && (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-sm font-semibold">
                        Save ${selectedProduct.originalPrice - selectedProduct.price}
                      </span>
                    )}
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Materials:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.materials.map((material, index) => (
                        <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Origin:</h4>
                    <p className="text-muted-foreground">{selectedProduct.origin}</p>
                  </div>
                </div>

                {/* Quantity and Add to Cart */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Quantity:</h4>
                    <div className="flex items-center space-x-3">
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

                  <div className="flex gap-3">
                    <Button 
                      className="afro-button flex-1"
                      onClick={() => {
                        for (let i = 0; i < quantity; i++) {
                          handleAddToCart(selectedProduct)
                        }
                        setSelectedProduct(null)
                        setQuantity(1)
                      }}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFavorite(selectedProduct.id)}
                    >
                      <Heart className={`h-4 w-4 ${
                        favorites.includes(selectedProduct.id) ? 'text-red-500 fill-current' : ''
                      }`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}