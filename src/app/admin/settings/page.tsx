"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/page-header";
// import { RowActions } from "@/components/admin/row-actions";

export default function SettingsPage() {

    type Coupon = {
      id: string;
      code: string;
      isActive: boolean;
      startsAt?: string | Date | null;
      expiresAt?: string | Date | null;
    };
    const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [subpage, setSubpage] = useState<string>("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCoupons() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (e) {
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (subpage === "discount-codes") fetchCoupons();
  }, [subpage]);

    async function handleDeleteCoupon(couponId: string) {
      if (!window.confirm("Delete this coupon?")) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/coupons", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ couponId }),
        });
        if (!res.ok) throw new Error("Failed to delete coupon");
        await fetchCoupons();
      } catch {
        setError("Failed to delete coupon");
      } finally {
        setLoading(false);
      }
    }

  return (
    <>
      <AdminPageHeader 
        title="Settings" 
        description="Control storefront highlights and incentives." 
      />
      <div className="min-h-screen bg-[#f5ecd7] py-10 px-4 lg:px-12">
        <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="rounded-2xl bg-[#e6cda3] p-6 flex flex-col gap-2 shadow-lg border border-[#a17c4d]/30">
            <h2 className="text-lg font-semibold text-[#3f3324] mb-4">Settings</h2>
            <nav className="flex flex-col gap-2">
              <button type="button" onClick={() => setSubpage("profile")} className={`rounded-lg px-4 py-2 text-sm font-medium ${subpage === "profile" ? "bg-[#b8d3c2] text-[#2d3b34]" : "text-[#6e5a44] hover:bg-[#f5ecd7]/80 hover:text-[#3f3324] transition"}`}>Profile</button>
              <button type="button" onClick={() => setSubpage("notifications")} className={`rounded-lg px-4 py-2 text-sm font-medium ${subpage === "notifications" ? "bg-[#b8d3c2] text-[#2d3b34]" : "text-[#6e5a44] hover:bg-[#f5ecd7]/80 hover:text-[#3f3324] transition"}`}>Notifications</button>
              <button type="button" onClick={() => setSubpage("security")} className={`rounded-lg px-4 py-2 text-sm font-medium ${subpage === "security" ? "bg-[#b8d3c2] text-[#2d3b34]" : "text-[#6e5a44] hover:bg-[#f5ecd7]/80 hover:text-[#3f3324] transition"}`}>Security</button>
              <button type="button" onClick={() => setSubpage("appearance")} className={`rounded-lg px-4 py-2 text-sm font-medium ${subpage === "appearance" ? "bg-[#b8d3c2] text-[#2d3b34]" : "text-[#6e5a44] hover:bg-[#f5ecd7]/80 hover:text-[#3f3324] transition"}`}>Appearance</button>
              <button type="button" onClick={() => setSubpage("discount-codes")} className={`rounded-lg px-4 py-2 text-sm font-medium ${subpage === "discount-codes" ? "bg-[#b8d3c2] text-[#2d3b34]" : "text-[#6e5a44] hover:bg-[#f5ecd7]/80 hover:text-[#3f3324] transition"}`}>Discount Codes</button>
            </nav>
          </aside>
          {/* Main content */}
          <main>
            {subpage === "profile" && (
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Storefront highlights and incentives as before */}
                ...existing code for highlights and incentives...
              </div>
            )}
            {subpage === "discount-codes" && (
              <div className="space-y-8">
                <Card>
                  <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CardTitle>Discount Codes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* {loading && <div>Loading...</div>} */}
                    {error && <div className="text-red-500">{error}</div>}
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs">Code</th>
                          <th className="px-6 py-4 text-left text-xs">Status</th>
                          <th className="px-6 py-4 text-left text-xs">Valid From</th>
                          <th className="px-6 py-4 text-left text-xs">Valid To</th>
                          <th className="px-6 py-4 text-left text-xs">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(coupons) && coupons.map((coupon) => (
                          <tr key={coupon.id} className="border-b last:border-b-0">
                            <td className="px-6 py-4">{coupon.code}</td>
                            <td className="px-6 py-4">{coupon.isActive ? "Active" : "Inactive"}</td>
                            <td className="px-6 py-4">{coupon.startsAt ? new Date(coupon.startsAt).toLocaleDateString() : "-"}</td>
                            <td className="px-6 py-4">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "-"}</td>
                            <td className="px-6 py-4">
                              <button
                                className="text-red-600 hover:underline text-xs"
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {Array.isArray(coupons) && coupons.length === 0 && !loading && <div className="text-[#a17c4d] italic">No coupons configured.</div>}
                    <div className="mt-6 flex justify-end">
                      <a href="/admin/coupons" className="text-sm font-medium text-brand-umber underline hover:text-brand-teal transition">Go to Discount Codes Management</a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {/* Add more subpage content as needed */}
          </main>
        </div>
      </div>
      </>
    )
  }
