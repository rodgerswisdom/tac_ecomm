'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Shield, ArrowLeft, Settings, MapPin, Pencil, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { CustomDropdown } from '@/components/ui/custom-dropdown'
import { countries } from '@/data/countries'

type ShippingFormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

const emptyShipping: ShippingFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US'
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [shipping, setShipping] = useState<ShippingFormData | null>(null)
  const [shippingLoading, setShippingLoading] = useState(true)
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState<ShippingFormData>(emptyShipping)
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressError, setAddressError] = useState('')

  useEffect(() => {
    if (!session?.user) return
    setShippingLoading(true)
    fetch('/api/user/shipping')
      .then(res => res.json())
      .then(data => {
        if (data.shipping) {
          setShipping(data.shipping)
          setAddressForm(data.shipping)
        } else {
          setAddressForm({ ...emptyShipping, email: session.user?.email ?? '' })
        }
      })
      .finally(() => setShippingLoading(false))
  }, [session?.user])

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault()
    setAddressError('')
    if (!addressForm.firstName || !addressForm.lastName || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.zipCode || !addressForm.country) {
      setAddressError('Please fill in all required fields.')
      return
    }
    setSavingAddress(true)
    try {
      const res = await fetch('/api/user/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      })
      const data = await res.json()
      if (!res.ok) {
        setAddressError(data.error || 'Failed to save address.')
        return
      }
      setShipping({ ...addressForm })
      setEditingAddress(false)
    } finally {
      setSavingAddress(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session?.user) {
    router.push('/auth/signin')
    return null
  }

  const getUserInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  const userName = session.user.name ?? undefined
  const userEmail = session.user.email ?? undefined

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator'
      case 'MODERATOR':
        return 'Moderator'
      case 'CUSTOMER':
        return 'Customer'
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="relative z-10 p-4">
        <Link href="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Store</span>
        </Link>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold luxury-heading mb-2">
              My <span className="afro-text-gradient">Profile</span>
            </h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          {/* Profile Card */}
          <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl mb-6">
            <CardHeader>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={session.user.image || undefined} alt={userName || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-emerald text-white text-2xl font-bold">
                    {getUserInitials(userName, userEmail)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {userName || 'User'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {userEmail}
                  </CardDescription>
                  {session.user.role && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Shield className="h-4 w-4" />
                      {getRoleLabel(session.user.role)}
                    </div>
                  )}
                </div>
                <Button asChild variant="outline">
                  <Link href="/profile/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Account Information */}
          <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl mb-6">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{userName || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <div className="p-2 rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <div className="p-2 rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Account Role</p>
                  <p className="font-medium">{getRoleLabel(session.user.role || 'CUSTOMER')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Shipping Address */}
          <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Default Shipping Address
                  </CardTitle>
                  <CardDescription>
                    Used to autofill checkout. You can edit it here or during checkout.
                  </CardDescription>
                </div>
                {!editingAddress && shipping && (
                  <Button variant="outline" size="sm" onClick={() => setEditingAddress(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {shippingLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading address…
                </div>
              ) : editingAddress || !shipping ? (
                <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="firstName" placeholder="First Name" value={addressForm.firstName} onChange={e => setAddressForm(f => ({ ...f, firstName: e.target.value }))} required />
                  <Input name="lastName" placeholder="Last Name" value={addressForm.lastName} onChange={e => setAddressForm(f => ({ ...f, lastName: e.target.value }))} required />
                  <Input name="email" type="email" placeholder="Email" value={addressForm.email} onChange={e => setAddressForm(f => ({ ...f, email: e.target.value }))} required className="md:col-span-2" />
                  <Input name="phone" placeholder="Phone" value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))} className="md:col-span-2" />
                  <Input name="address" placeholder="Address" value={addressForm.address} onChange={e => setAddressForm(f => ({ ...f, address: e.target.value }))} required className="md:col-span-2" />
                  <Input name="city" placeholder="City" value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} required />
                  <Input name="state" placeholder="State" value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))} required />
                  <Input name="zipCode" placeholder="ZIP / Postal Code" value={addressForm.zipCode} onChange={e => setAddressForm(f => ({ ...f, zipCode: e.target.value }))} required />
                  <div className="md:col-span-2">
                    <CustomDropdown
                      options={countries.map(c => ({ value: c.code, label: c.name }))}
                      value={addressForm.country}
                      onChange={country => setAddressForm(f => ({ ...f, country }))}
                      placeholder="Select Country"
                      searchable
                      className="w-full"
                    />
                  </div>
                  {addressError && <p className="text-red-500 text-sm col-span-2">{addressError}</p>}
                  <div className="col-span-2 flex gap-2">
                    <Button type="submit" disabled={savingAddress}>
                      {savingAddress ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save address
                    </Button>
                    {shipping && (
                      <Button type="button" variant="outline" onClick={() => { setEditingAddress(false); setAddressForm(shipping); setAddressError(''); }}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{shipping.firstName} {shipping.lastName}</p>
                  <p>{shipping.address}</p>
                  <p>{shipping.city}, {shipping.state} {shipping.zipCode}, {shipping.country}</p>
                  {shipping.phone && <p>{shipping.phone}</p>}
                  <p>{shipping.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild variant="outline" className="h-auto py-4 justify-start">
                  <Link href="/profile/settings">
                    <Settings className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Account Settings</div>
                      <div className="text-xs text-muted-foreground">Update your preferences</div>
                    </div>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 justify-start">
                  <Link href="/orders">
                    <Calendar className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Order History</div>
                      <div className="text-xs text-muted-foreground">View your past orders</div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
