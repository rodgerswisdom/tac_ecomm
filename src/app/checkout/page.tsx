'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CustomDropdown } from '@/components/ui/custom-dropdown'
import { Crown, ArrowLeft, CreditCard, MapPin, Truck, Shield, CheckCircle, Lock, Mail, Phone, User, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { initializeFraudDetection, checkFraudRisk, shouldAllowTransaction, createTransactionId, type FraudCheckResult } from '@/lib/fraud'

interface CartItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
}

interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  paymentMethod: string
  shippingMethod: string
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [form, setForm] = useState<CheckoutForm>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    paymentMethod: 'pesapal',
    shippingMethod: 'standard'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showAccountPrompt, setShowAccountPrompt] = useState(false)
  const [fraudCheckResult, setFraudCheckResult] = useState<FraudCheckResult | null>(null)
  const [showFraudChallenge, setShowFraudChallenge] = useState(false)
  const [fraudChallengeMessage, setFraudChallengeMessage] = useState<string>('')
  const [fraudBlocked, setFraudBlocked] = useState(false)
  const [fraudBlockMessage, setFraudBlockMessage] = useState<string>('')

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('tac-cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset fraud-related states
    setFraudCheckResult(null)
    setShowFraudChallenge(false)
    setFraudBlocked(false)
    setFraudBlockMessage('')
    
    setIsProcessing(true)
    
    try {
      // Perform fraud check before processing payment
      const fraudResult = await checkFraudRisk()
      setFraudCheckResult(fraudResult)
      
      const decision = shouldAllowTransaction(fraudResult)
      
      if (!decision.allowed) {
        // Transaction blocked
        setFraudBlocked(true)
        setFraudBlockMessage(decision.message || 'Transaction cannot be completed due to security concerns.')
        setIsProcessing(false)
        return
      }
      
      if (decision.requiresChallenge) {
        // Show challenge UI
        setShowFraudChallenge(true)
        setFraudChallengeMessage(decision.message || 'Please verify your identity to continue.')
        setIsProcessing(false)
        return
      }
      
      // Create transaction ID for tracking
      const transactionId = await createTransactionId({
        amount: total,
        currency: 'USD',
      })
      
      if (transactionId) {
        console.log('Transaction ID:', transactionId)
      }
      
      // Proceed with payment processing
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setIsProcessing(false)
      setIsCompleted(true)
      
      // Clear cart after successful order
      localStorage.removeItem('tac-cart')
      setCartItems([])
      
      // Show account creation prompt
      setTimeout(() => {
        setShowAccountPrompt(true)
      }, 2000)
    } catch (error) {
      console.error('Error during checkout:', error)
      setIsProcessing(false)
      // Allow transaction to proceed if fraud check fails (fail-open)
    }
  }

  const handleFraudChallengeContinue = async () => {
    setIsProcessing(true)
    setShowFraudChallenge(false)
    
    try {
      // Create transaction ID for tracking
      const transactionId = await createTransactionId({
        amount: total,
        currency: 'USD',
      })
      
      if (transactionId) {
        console.log('Transaction ID:', transactionId)
      }
      
      // Proceed with payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setIsProcessing(false)
      setIsCompleted(true)
      
      // Clear cart after successful order
      localStorage.removeItem('tac-cart')
      setCartItems([])
      
      // Show account creation prompt
      setTimeout(() => {
        setShowAccountPrompt(true)
      }, 2000)
    } catch (error) {
      console.error('Error during checkout:', error)
      setIsProcessing(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = form.shippingMethod === 'express' ? 25 : form.shippingMethod === 'standard' ? 15 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const countryOptions = [
    { value: 'AF', label: 'Afghanistan' },
    { value: 'AL', label: 'Albania' },
    { value: 'DZ', label: 'Algeria' },
    { value: 'AS', label: 'American Samoa' },
    { value: 'AD', label: 'Andorra' },
    { value: 'AO', label: 'Angola' },
    { value: 'AI', label: 'Anguilla' },
    { value: 'AQ', label: 'Antarctica' },
    { value: 'AG', label: 'Antigua and Barbuda' },
    { value: 'AR', label: 'Argentina' },
    { value: 'AM', label: 'Armenia' },
    { value: 'AW', label: 'Aruba' },
    { value: 'AU', label: 'Australia' },
    { value: 'AT', label: 'Austria' },
    { value: 'AZ', label: 'Azerbaijan' },
    { value: 'BS', label: 'Bahamas' },
    { value: 'BH', label: 'Bahrain' },
    { value: 'BD', label: 'Bangladesh' },
    { value: 'BB', label: 'Barbados' },
    { value: 'BY', label: 'Belarus' },
    { value: 'BE', label: 'Belgium' },
    { value: 'BZ', label: 'Belize' },
    { value: 'BJ', label: 'Benin' },
    { value: 'BM', label: 'Bermuda' },
    { value: 'BT', label: 'Bhutan' },
    { value: 'BO', label: 'Bolivia' },
    { value: 'BA', label: 'Bosnia and Herzegovina' },
    { value: 'BW', label: 'Botswana' },
    { value: 'BV', label: 'Bouvet Island' },
    { value: 'BR', label: 'Brazil' },
    { value: 'IO', label: 'British Indian Ocean Territory' },
    { value: 'BN', label: 'Brunei Darussalam' },
    { value: 'BG', label: 'Bulgaria' },
    { value: 'BF', label: 'Burkina Faso' },
    { value: 'BI', label: 'Burundi' },
    { value: 'KH', label: 'Cambodia' },
    { value: 'CM', label: 'Cameroon' },
    { value: 'CA', label: 'Canada' },
    { value: 'CV', label: 'Cape Verde' },
    { value: 'KY', label: 'Cayman Islands' },
    { value: 'CF', label: 'Central African Republic' },
    { value: 'TD', label: 'Chad' },
    { value: 'CL', label: 'Chile' },
    { value: 'CN', label: 'China' },
    { value: 'CX', label: 'Christmas Island' },
    { value: 'CC', label: 'Cocos (Keeling) Islands' },
    { value: 'CO', label: 'Colombia' },
    { value: 'KM', label: 'Comoros' },
    { value: 'CG', label: 'Congo' },
    { value: 'CD', label: 'Congo, Democratic Republic' },
    { value: 'CK', label: 'Cook Islands' },
    { value: 'CR', label: 'Costa Rica' },
    { value: 'CI', label: "Côte d'Ivoire" },
    { value: 'HR', label: 'Croatia' },
    { value: 'CU', label: 'Cuba' },
    { value: 'CY', label: 'Cyprus' },
    { value: 'CZ', label: 'Czech Republic' },
    { value: 'DK', label: 'Denmark' },
    { value: 'DJ', label: 'Djibouti' },
    { value: 'DM', label: 'Dominica' },
    { value: 'DO', label: 'Dominican Republic' },
    { value: 'EC', label: 'Ecuador' },
    { value: 'EG', label: 'Egypt' },
    { value: 'SV', label: 'El Salvador' },
    { value: 'GQ', label: 'Equatorial Guinea' },
    { value: 'ER', label: 'Eritrea' },
    { value: 'EE', label: 'Estonia' },
    { value: 'ET', label: 'Ethiopia' },
    { value: 'FK', label: 'Falkland Islands (Malvinas)' },
    { value: 'FO', label: 'Faroe Islands' },
    { value: 'FJ', label: 'Fiji' },
    { value: 'FI', label: 'Finland' },
    { value: 'FR', label: 'France' },
    { value: 'GF', label: 'French Guiana' },
    { value: 'PF', label: 'French Polynesia' },
    { value: 'TF', label: 'French Southern Territories' },
    { value: 'GA', label: 'Gabon' },
    { value: 'GM', label: 'Gambia' },
    { value: 'GE', label: 'Georgia' },
    { value: 'DE', label: 'Germany' },
    { value: 'GH', label: 'Ghana' },
    { value: 'GI', label: 'Gibraltar' },
    { value: 'GR', label: 'Greece' },
    { value: 'GL', label: 'Greenland' },
    { value: 'GD', label: 'Grenada' },
    { value: 'GP', label: 'Guadeloupe' },
    { value: 'GU', label: 'Guam' },
    { value: 'GT', label: 'Guatemala' },
    { value: 'GG', label: 'Guernsey' },
    { value: 'GN', label: 'Guinea' },
    { value: 'GW', label: 'Guinea-Bissau' },
    { value: 'GY', label: 'Guyana' },
    { value: 'HT', label: 'Haiti' },
    { value: 'HM', label: 'Heard Island and McDonald Islands' },
    { value: 'VA', label: 'Holy See (Vatican City State)' },
    { value: 'HN', label: 'Honduras' },
    { value: 'HK', label: 'Hong Kong' },
    { value: 'HU', label: 'Hungary' },
    { value: 'IS', label: 'Iceland' },
    { value: 'IN', label: 'India' },
    { value: 'ID', label: 'Indonesia' },
    { value: 'IR', label: 'Iran, Islamic Republic' },
    { value: 'IQ', label: 'Iraq' },
    { value: 'IE', label: 'Ireland' },
    { value: 'IM', label: 'Isle of Man' },
    { value: 'IL', label: 'Israel' },
    { value: 'IT', label: 'Italy' },
    { value: 'JM', label: 'Jamaica' },
    { value: 'JP', label: 'Japan' },
    { value: 'JE', label: 'Jersey' },
    { value: 'JO', label: 'Jordan' },
    { value: 'KZ', label: 'Kazakhstan' },
    { value: 'KE', label: 'Kenya' },
    { value: 'KI', label: 'Kiribati' },
    { value: 'KP', label: "Korea, Democratic People's Republic" },
    { value: 'KR', label: 'Korea, Republic' },
    { value: 'KW', label: 'Kuwait' },
    { value: 'KG', label: 'Kyrgyzstan' },
    { value: 'LA', label: "Lao People's Democratic Republic" },
    { value: 'LV', label: 'Latvia' },
    { value: 'LB', label: 'Lebanon' },
    { value: 'LS', label: 'Lesotho' },
    { value: 'LR', label: 'Liberia' },
    { value: 'LY', label: 'Libyan Arab Jamahiriya' },
    { value: 'LI', label: 'Liechtenstein' },
    { value: 'LT', label: 'Lithuania' },
    { value: 'LU', label: 'Luxembourg' },
    { value: 'MO', label: 'Macao' },
    { value: 'MK', label: 'Macedonia, Former Yugoslav Republic' },
    { value: 'MG', label: 'Madagascar' },
    { value: 'MW', label: 'Malawi' },
    { value: 'MY', label: 'Malaysia' },
    { value: 'MV', label: 'Maldives' },
    { value: 'ML', label: 'Mali' },
    { value: 'MT', label: 'Malta' },
    { value: 'MH', label: 'Marshall Islands' },
    { value: 'MQ', label: 'Martinique' },
    { value: 'MR', label: 'Mauritania' },
    { value: 'MU', label: 'Mauritius' },
    { value: 'YT', label: 'Mayotte' },
    { value: 'MX', label: 'Mexico' },
    { value: 'FM', label: 'Micronesia, Federated States' },
    { value: 'MD', label: 'Moldova, Republic' },
    { value: 'MC', label: 'Monaco' },
    { value: 'MN', label: 'Mongolia' },
    { value: 'ME', label: 'Montenegro' },
    { value: 'MS', label: 'Montserrat' },
    { value: 'MA', label: 'Morocco' },
    { value: 'MZ', label: 'Mozambique' },
    { value: 'MM', label: 'Myanmar' },
    { value: 'NA', label: 'Namibia' },
    { value: 'NR', label: 'Nauru' },
    { value: 'NP', label: 'Nepal' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'AN', label: 'Netherlands Antilles' },
    { value: 'NC', label: 'New Caledonia' },
    { value: 'NZ', label: 'New Zealand' },
    { value: 'NI', label: 'Nicaragua' },
    { value: 'NE', label: 'Niger' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'NU', label: 'Niue' },
    { value: 'NF', label: 'Norfolk Island' },
    { value: 'MP', label: 'Northern Mariana Islands' },
    { value: 'NO', label: 'Norway' },
    { value: 'OM', label: 'Oman' },
    { value: 'PK', label: 'Pakistan' },
    { value: 'PW', label: 'Palau' },
    { value: 'PS', label: 'Palestinian Territory' },
    { value: 'PA', label: 'Panama' },
    { value: 'PG', label: 'Papua New Guinea' },
    { value: 'PY', label: 'Paraguay' },
    { value: 'PE', label: 'Peru' },
    { value: 'PH', label: 'Philippines' },
    { value: 'PN', label: 'Pitcairn' },
    { value: 'PL', label: 'Poland' },
    { value: 'PT', label: 'Portugal' },
    { value: 'PR', label: 'Puerto Rico' },
    { value: 'QA', label: 'Qatar' },
    { value: 'RE', label: 'Réunion' },
    { value: 'RO', label: 'Romania' },
    { value: 'RU', label: 'Russian Federation' },
    { value: 'RW', label: 'Rwanda' },
    { value: 'SH', label: 'Saint Helena' },
    { value: 'KN', label: 'Saint Kitts and Nevis' },
    { value: 'LC', label: 'Saint Lucia' },
    { value: 'PM', label: 'Saint Pierre and Miquelon' },
    { value: 'VC', label: 'Saint Vincent and the Grenadines' },
    { value: 'WS', label: 'Samoa' },
    { value: 'SM', label: 'San Marino' },
    { value: 'ST', label: 'Sao Tome and Principe' },
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'SN', label: 'Senegal' },
    { value: 'RS', label: 'Serbia' },
    { value: 'SC', label: 'Seychelles' },
    { value: 'SL', label: 'Sierra Leone' },
    { value: 'SG', label: 'Singapore' },
    { value: 'SK', label: 'Slovakia' },
    { value: 'SI', label: 'Slovenia' },
    { value: 'SB', label: 'Solomon Islands' },
    { value: 'SO', label: 'Somalia' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'GS', label: 'South Georgia and the South Sandwich Islands' },
    { value: 'ES', label: 'Spain' },
    { value: 'LK', label: 'Sri Lanka' },
    { value: 'SD', label: 'Sudan' },
    { value: 'SR', label: 'Suriname' },
    { value: 'SJ', label: 'Svalbard and Jan Mayen' },
    { value: 'SZ', label: 'Swaziland' },
    { value: 'SE', label: 'Sweden' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'SY', label: 'Syrian Arab Republic' },
    { value: 'TW', label: 'Taiwan, Province of China' },
    { value: 'TJ', label: 'Tajikistan' },
    { value: 'TZ', label: 'Tanzania, United Republic' },
    { value: 'TH', label: 'Thailand' },
    { value: 'TL', label: 'Timor-Leste' },
    { value: 'TG', label: 'Togo' },
    { value: 'TK', label: 'Tokelau' },
    { value: 'TO', label: 'Tonga' },
    { value: 'TT', label: 'Trinidad and Tobago' },
    { value: 'TN', label: 'Tunisia' },
    { value: 'TR', label: 'Turkey' },
    { value: 'TM', label: 'Turkmenistan' },
    { value: 'TC', label: 'Turks and Caicos Islands' },
    { value: 'TV', label: 'Tuvalu' },
    { value: 'UG', label: 'Uganda' },
    { value: 'UA', label: 'Ukraine' },
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'US', label: 'United States' },
    { value: 'UM', label: 'United States Minor Outlying Islands' },
    { value: 'UY', label: 'Uruguay' },
    { value: 'UZ', label: 'Uzbekistan' },
    { value: 'VU', label: 'Vanuatu' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'VN', label: 'Viet Nam' },
    { value: 'VG', label: 'Virgin Islands, British' },
    { value: 'VI', label: 'Virgin Islands, U.S.' },
    { value: 'WF', label: 'Wallis and Futuna' },
    { value: 'EH', label: 'Western Sahara' },
    { value: 'YE', label: 'Yemen' },
    { value: 'ZM', label: 'Zambia' },
    { value: 'ZW', label: 'Zimbabwe' }
  ]

  const shippingOptions = [
    { value: 'free', label: 'Free Shipping (7-10 days)' },
    { value: 'standard', label: 'Standard (5-7 days) - $15' },
    { value: 'express', label: 'Express (2-3 days) - $25' }
  ]

  const paymentOptions = [
    { value: 'pesapal', label: 'Pesapal (Mobile Money)' },
    { value: 'paypal', label: 'PayPal' }
  ]

  if (cartItems.length === 0 && !isCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-16 text-center">
          <Crown className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart before checking out.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/collections">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/bespoke">Explore Bespoke Studio</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold luxury-heading mb-4">
              Order <span className="afro-text-gradient">Confirmed</span>!
            </h1>
            <p className="text-xl text-muted-foreground luxury-text mb-8">
              Thank you for your purchase! Your order has been successfully placed and you will receive a confirmation email shortly.
            </p>
            <div className="space-y-4">
              <Button className="text-lg px-8 py-6" asChild>
                <Link href="/products">
                  Continue Shopping
                </Link>
              </Button>
              <Button variant="outline" className="text-lg px-8 py-6" asChild>
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/cart" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Cart</span>
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold luxury-heading">
            Secure <span className="afro-text-gradient">Checkout</span>
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Transactions are encrypted and protected end-to-end.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-8 overflow-visible">
              {/* Progress Indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <span className="text-sm font-medium">Contact & Shipping</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <span className="text-sm text-muted-foreground">Payment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <span className="text-sm text-muted-foreground">Review</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-emerald h-2 rounded-full w-1/3 transition-all duration-500"></div>
                </div>
              </motion.div>
              {/* Contact Information */}
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl overflow-visible relative z-30">
                <CardHeader className="bg-gradient-to-r from-emerald/5 to-gold/5 border-b border-border/30">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-emerald/20">
                      <Mail className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleInputChange}
                          required
                          className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                          placeholder="your@email.com"
                        />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl overflow-visible relative z-20">
                <CardHeader className="bg-gradient-to-r from-blue/5 to-emerald/5 border-b border-border/30">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-blue/20">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <span>Shipping Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-2">
                      Street Address *
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-2">
                        City *
                      </label>
                      <Input
                        id="city"
                        name="city"
                        value={form.city}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-2">
                        State/Province *
                      </label>
                      <Input
                        id="state"
                        name="state"
                        value={form.state}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-2">
                        ZIP/Postal Code *
                      </label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={form.zipCode}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                        placeholder="12345"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country *
                    </label>
                    <CustomDropdown
                      options={countryOptions}
                      value={form.country}
                      onChange={(value) => setForm(prev => ({ ...prev, country: value }))}
                      placeholder="Select country"
                      searchable={true}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl overflow-visible relative z-10">
                <CardHeader className="bg-gradient-to-r from-purple/5 to-blue/5 border-b border-border/30">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-purple/20">
                      <Truck className="h-5 w-5 text-purple-500" />
                    </div>
                    <span>Shipping Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomDropdown
                    options={shippingOptions}
                    value={form.shippingMethod}
                    onChange={(value) => setForm(prev => ({ ...prev, shippingMethod: value }))}
                    placeholder="Select shipping method"
                  />
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl overflow-visible relative z-0">
                <CardHeader className="bg-gradient-to-r from-gold/5 to-emerald/5 border-b border-border/30">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-gold/20">
                      <CreditCard className="h-5 w-5 text-gold" />
                    </div>
                    <span>Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Payment Method *
                    </label>
                    <CustomDropdown
                      options={paymentOptions}
                      value={form.paymentMethod}
                      onChange={(value) => setForm(prev => ({ ...prev, paymentMethod: value }))}
                      placeholder="Select payment method"
                    />
                  </div>
                  
                  {(form.paymentMethod === 'pesapal' || form.paymentMethod === 'paypal') && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
                      <p className="text-muted-foreground">
                        Your payment will be processed securely through {form.paymentMethod === 'pesapal' ? 'Pesapal' : 'PayPal'}. 
                        You will be redirected to complete your payment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Place Order Button */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-emerald hover:from-primary/90 hover:to-emerald/90 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Order...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Place Order - ${total.toFixed(2)}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 relative z-0">
            <Card className="afro-card sticky top-24 bg-background/90 backdrop-blur-md border-border/50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-emerald/5 border-b border-border/30">
                <CardTitle className="luxury-heading flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                      <div className="w-12 h-12 relative overflow-hidden rounded-lg border border-border/30">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/30 pt-4 space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border/30 pt-3">
                    <div className="flex justify-between items-center text-lg font-bold bg-gradient-to-r from-primary/10 to-emerald/10 p-3 rounded-lg">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <span>Free returns within 30 days</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Crown className="h-4 w-4 text-gold" />
                    <span>Authentic African craftsmanship</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fraud Challenge Modal */}
      {showFraudChallenge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold luxury-heading mb-2">
                Security <span className="afro-text-gradient">Verification</span>
              </h3>
              <p className="text-muted-foreground mb-6">
                {fraudChallengeMessage}
              </p>
              {fraudCheckResult && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg text-left">
                  <p className="text-sm text-muted-foreground mb-2">
                    Risk Score: <span className="font-semibold text-foreground">{fraudCheckResult.risk_score}/100</span>
                  </p>
                  {fraudCheckResult.reason.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Risk Factors:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {fraudCheckResult.reason.map((reason, idx) => (
                          <li key={idx} className="text-xs">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleFraudChallengeContinue}
                >
                  Continue with Verification
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowFraudChallenge(false)
                    setFraudCheckResult(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Fraud Blocked Modal */}
      {fraudBlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold luxury-heading mb-2">
                Transaction <span className="text-red-600">Blocked</span>
              </h3>
              <p className="text-muted-foreground mb-6">
                {fraudBlockMessage}
              </p>
              {fraudCheckResult && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg text-left">
                  <p className="text-sm text-muted-foreground mb-2">
                    Risk Score: <span className="font-semibold text-red-600">{fraudCheckResult.risk_score}/100</span>
                  </p>
                  {fraudCheckResult.reason.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Risk Factors:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {fraudCheckResult.reason.map((reason, idx) => (
                          <li key={idx} className="text-xs">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  asChild
                >
                  <Link href="/contact">
                    Contact Support
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setFraudBlocked(false)
                    setFraudBlockMessage('')
                    setFraudCheckResult(null)
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Account Creation Prompt Modal */}
      {showAccountPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold luxury-heading mb-2">
                Order <span className="afro-text-gradient">Complete!</span>
              </h3>
              <p className="text-muted-foreground mb-6">
                Create an account to track your orders, receive bespoke recommendations, and enjoy faster checkout next time.
              </p>
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/auth/signup">
                    Create Account
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAccountPrompt(false)}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
