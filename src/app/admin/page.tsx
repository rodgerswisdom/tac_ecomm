'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CustomDropdown } from '@/components/ui/custom-dropdown'
import { 
  Crown, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Heart,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  stock: number
  status: 'active' | 'inactive' | 'draft'
  sales: number
  rating: number
  reviews: number
  createdAt: string
}

interface Order {
  id: number
  customerName: string
  email: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: number
  createdAt: string
  shippingAddress: string
}

interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin' | 'moderator'
  status: 'active' | 'inactive' | 'banned'
  orders: number
  totalSpent: number
  joinedAt: string
  lastLogin: string
}

interface Analytics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
  productsGrowth: number
  topSellingProducts: Product[]
  recentOrders: Order[]
  salesByCategory: { category: string; sales: number; percentage: number }[]
  monthlyRevenue: { month: string; revenue: number }[]
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - in a real app, this would come from an API
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Royal Gold Adinkra Necklace",
      price: 899,
      originalPrice: 1199,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop&crop=center",
      category: "necklaces",
      stock: 15,
      status: 'active',
      sales: 124,
      rating: 4.9,
      reviews: 89,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Emerald Heritage Ring",
      price: 599,
      originalPrice: 799,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop&crop=center",
      category: "rings",
      stock: 8,
      status: 'active',
      sales: 67,
      rating: 4.8,
      reviews: 45,
      createdAt: "2024-01-10"
    },
    {
      id: 3,
      name: "Bronze Warrior Bracelet",
      price: 399,
      originalPrice: 549,
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop&crop=center",
      category: "bracelets",
      stock: 0,
      status: 'inactive',
      sales: 23,
      rating: 4.7,
      reviews: 12,
      createdAt: "2024-01-08"
    }
  ])

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1001,
      customerName: "Aisha Johnson",
      email: "aisha@example.com",
      total: 1298,
      status: 'delivered',
      items: 2,
      createdAt: "2024-01-20",
      shippingAddress: "123 Main St, Accra, Ghana"
    },
    {
      id: 1002,
      customerName: "Kwame Asante",
      email: "kwame@example.com",
      total: 599,
      status: 'shipped',
      items: 1,
      createdAt: "2024-01-19",
      shippingAddress: "456 Heritage Ave, Kumasi, Ghana"
    },
    {
      id: 1003,
      customerName: "Sarah Williams",
      email: "sarah@example.com",
      total: 899,
      status: 'processing',
      items: 1,
      createdAt: "2024-01-18",
      shippingAddress: "789 Culture Rd, Lagos, Nigeria"
    }
  ])

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Aisha Johnson",
      email: "aisha@example.com",
      role: 'customer',
      status: 'active',
      orders: 5,
      totalSpent: 3247,
      joinedAt: "2023-12-15",
      lastLogin: "2024-01-20"
    },
    {
      id: 2,
      name: "Kwame Asante",
      email: "kwame@example.com",
      role: 'customer',
      status: 'active',
      orders: 3,
      totalSpent: 1899,
      joinedAt: "2024-01-05",
      lastLogin: "2024-01-19"
    },
    {
      id: 3,
      name: "Admin User",
      email: "admin@tacjewellery.com",
      role: 'admin',
      status: 'active',
      orders: 0,
      totalSpent: 0,
      joinedAt: "2023-01-01",
      lastLogin: "2024-01-20"
    }
  ])

  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 45678,
    totalOrders: 234,
    totalCustomers: 156,
    totalProducts: 45,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    customersGrowth: 15.2,
    productsGrowth: 5.7,
    topSellingProducts: [],
    recentOrders: [],
    salesByCategory: [
      { category: 'necklaces', sales: 45, percentage: 35 },
      { category: 'rings', sales: 32, percentage: 25 },
      { category: 'bracelets', sales: 28, percentage: 22 },
      { category: 'earrings', sales: 23, percentage: 18 }
    ],
    monthlyRevenue: [
      { month: 'Oct', revenue: 3200 },
      { month: 'Nov', revenue: 3800 },
      { month: 'Dec', revenue: 4200 },
      { month: 'Jan', revenue: 4500 }
    ]
  })

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id))
  }

  const handleUpdateProductStatus = (id: number, status: 'active' | 'inactive' | 'draft') => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, status } : product
    ))
  }

  const handleUpdateOrderStatus = (id: number, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status } : order
    ))
  }

  const handleUpdateUserStatus = (id: number, status: 'active' | 'inactive' | 'banned') => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status } : user
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800'
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'banned':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'processing':
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'inactive':
      case 'cancelled':
      case 'banned':
        return <AlertCircle className="h-4 w-4" />
      case 'draft':
        return <Edit className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold luxury-heading afro-text-gradient">
              TAC Jewellery Admin
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <Eye className="mr-2 h-4 w-4" />
                View Store
              </Link>
            </Button>
            <Button>
              <Crown className="mr-2 h-4 w-4" />
              Admin User
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
          <h1 className="text-3xl md:text-4xl font-bold luxury-heading mb-4">
            Admin <span className="afro-text-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground luxury-text">
            Manage your TAC Jewellery store with powerful analytics and tools.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 border-b border-border">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
              { id: 'products', name: 'Products', icon: <Package className="h-4 w-4" /> },
              { id: 'orders', name: 'Orders', icon: <ShoppingBag className="h-4 w-4" /> },
              { id: 'users', name: 'Users', icon: <Users className="h-4 w-4" /> },
              { id: 'analytics', name: 'Analytics', icon: <PieChart className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Revenue',
                  value: `$${analytics.totalRevenue.toLocaleString()}`,
                  change: analytics.revenueGrowth,
                  icon: <DollarSign className="h-6 w-6 text-emerald-500" />,
                  color: 'emerald'
                },
                {
                  title: 'Total Orders',
                  value: analytics.totalOrders.toLocaleString(),
                  change: analytics.ordersGrowth,
                  icon: <ShoppingBag className="h-6 w-6 text-blue-500" />,
                  color: 'blue'
                },
                {
                  title: 'Total Customers',
                  value: analytics.totalCustomers.toLocaleString(),
                  change: analytics.customersGrowth,
                  icon: <Users className="h-6 w-6 text-purple-500" />,
                  color: 'purple'
                },
                {
                  title: 'Total Products',
                  value: analytics.totalProducts.toLocaleString(),
                  change: analytics.productsGrowth,
                  icon: <Package className="h-6 w-6 text-gold" />,
                  color: 'gold'
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="afro-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <div className="flex items-center space-x-1 mt-2">
                            {stat.change > 0 ? (
                              <TrendingUp className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${stat.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {stat.change > 0 ? '+' : ''}{stat.change}%
                            </span>
                          </div>
                        </div>
                        <div className="p-3 rounded-full bg-muted/50">
                          {stat.icon}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="afro-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Recent Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.total}</p>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Products Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <CustomDropdown
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'draft', label: 'Draft' }
                  ]}
                  value={selectedFilter}
                  onChange={setSelectedFilter}
                  placeholder="Filter by status"
                />
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter(product => 
                  product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (selectedFilter === 'all' || product.status === selectedFilter)
                )
                .map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="afro-card overflow-hidden">
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {getStatusIcon(product.status)}
                          <span>{product.status}</span>
                        </span>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>
                        {product.category} • Stock: {product.stock}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xl font-bold text-primary">${product.price}</p>
                          {product.originalPrice && (
                            <p className="text-sm text-muted-foreground line-through">${product.originalPrice}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Card className="afro-card">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.email}</p>
                          <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.total}</p>
                        <p className="text-sm text-muted-foreground">{order.items} items</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <CustomDropdown
                            options={[
                              { value: 'pending', label: 'Pending' },
                              { value: 'processing', label: 'Processing' },
                              { value: 'shipped', label: 'Shipped' },
                              { value: 'delivered', label: 'Delivered' },
                              { value: 'cancelled', label: 'Cancelled' }
                            ]}
                            value={order.status}
                            onChange={(status) => handleUpdateOrderStatus(order.id, status as Order['status'])}
                            className="min-w-[120px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Card className="afro-card">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-emerald/20 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.orders} orders • ${user.totalSpent} spent
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {getStatusIcon(user.status)}
                          <span>{user.status}</span>
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">{user.role}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <CustomDropdown
                            options={[
                              { value: 'active', label: 'Active' },
                              { value: 'inactive', label: 'Inactive' },
                              { value: 'banned', label: 'Banned' }
                            ]}
                            value={user.status}
                            onChange={(status) => handleUpdateUserStatus(user.id, status as User['status'])}
                            className="min-w-[100px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="afro-card">
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.salesByCategory.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full bg-primary"></div>
                          <span className="capitalize">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{category.sales} sales</p>
                          <p className="text-sm text-muted-foreground">{category.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="afro-card">
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.monthlyRevenue.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{month.month}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-emerald rounded-full"
                              style={{ width: `${(month.revenue / 5000) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">${month.revenue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}