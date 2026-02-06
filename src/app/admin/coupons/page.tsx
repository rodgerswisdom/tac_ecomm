"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminPageHeader } from "@/components/admin/page-header"
import { RowActions } from "@/components/admin/row-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CouponType } from "@prisma/client"
import { useState, useEffect } from "react"
import { useRef } from "react"
import React from "react"
import { Plus } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  usedCount: number;
  maxUses?: number | null;
  startsAt?: string | Date | null;
  expiresAt?: string | Date | null;
  description?: string | null;
};

export default function AdminCouponsPage() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [usageStats, setUsageStats] = useState<any>({});
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(""); // Default: show all, not just active
  const [type, setType] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc"|"desc">("desc");
  const [selected, setSelected] = useState<string[]>([]);
  const [detailsCoupon, setDetailsCoupon] = useState<Coupon|null>(null);
  const [timingDialog, setTimingDialog] = useState<{open: boolean, couponIds: string[], defaultStart?: string, defaultEnd?: string, onConfirm?: (start: string, end: string) => void}>({open: false, couponIds: []});
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);


  const fetchCoupons = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        q, status, type, start, end,
        page: String(page), pageSize: String(pageSize), sort, order
      });
      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      const data = await res.json();
      setCoupons(data.coupons || []);
      setTotal(data.total || 0);
      setUsageStats(data.usageStats || {});
    } catch {
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
    
    }, [q, status, type, start, end, page, pageSize, sort, order]);
  
  function NewCouponForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setLoading(true);
      setError(null);
      const formData = new FormData(e.currentTarget);
      try {
        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to create coupon");
        setToast({ message: "Coupon created successfully!", type: "success" });
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToast(null), 3000);
        onSuccess();
      } catch (err: any) {
        setError(err.message || "Failed to create coupon");
      } finally {
        setLoading(false);
      }
    }
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Input name="code" placeholder="Code" required maxLength={32} />
        <Input name="description" placeholder="Description" />
        <select name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value={CouponType.PERCENTAGE}>Percentage</option>
          <option value={CouponType.FIXED_AMOUNT}>Fixed Amount</option>
          <option value={CouponType.FREE_SHIPPING}>Free Shipping</option>
        </select>
        <Input name="value" placeholder="Value" type="number" step="0.01" required />
        <Input name="minAmount" placeholder="Minimum Order Amount" type="number" step="0.01" />
        <Input name="maxUses" placeholder="Max Uses" type="number" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" value="true" defaultChecked /> Active
        </label>
        <Input name="startsAt" placeholder="Start Date" type="date" min={new Date().toISOString().split('T')[0]} />
        <Input name="expiresAt" placeholder="End Date" type="date" min={new Date().toISOString().split('T')[0]} />
        <DialogFooter>
          <div className="flex w-full gap-2">
            <Button type="button" variant="ghost" onClick={onSuccess} disabled={loading} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? "Creating..." : "Create Coupon"}</Button>
          </div>
        </DialogFooter>
      </form>
    );
  }

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // Keep page within available bounds when total or pageSize changes
  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    setSelected(e.target.checked ? coupons.map(c => c.id) : []);
  }
  function handleSelect(id: string) {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  }

  async function handleBulkDelete() {
    let success = true;
    for (const id of selected) {
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId: id })
      });
      if (!res.ok) success = false;
    }
    setSelected([]);
    fetchCoupons();
    // Show toast after deletion
    const message = success ? `Deleted ${selected.length} coupon(s).` : 'Some coupons could not be deleted.';
    setToast({ message, type: success ? 'success' : 'error' });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }

  // Store pending activation dates for confirmation
  const [pendingActivation, setPendingActivation] = useState<{start: string, end: string} | null>(null);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  async function handleBulkActivate(active: boolean) {
    let success = true;
    let message = '';
    if (active) {
      // Show timing dialog first
      setTimingDialog({
        open: true,
        couponIds: selected,
        onConfirm: (start, end) => {
          setTimingDialog({ open: false, couponIds: [] });
          setPendingActivation({ start, end });
          setShowFinalConfirm(true);
        }
      });
    } else {
      for (const id of selected) {
        const res = await fetch(`/api/admin/coupons`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ couponId: id, isActive: false })
        });
        if (!res.ok) success = false;
      }
      setSelected([]);
      fetchCoupons();
      message = success ? `Deactivated ${selected.length} coupon(s).` : 'Some coupons could not be deactivated.';
      setToast({ message, type: success ? 'success' : 'error' });
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToast(null), 3000);
    }
  }

  // Final confirmation for activation with dates
  async function confirmBulkActivateWithDates() {
    if (!pendingActivation) return;
    let success = true;
    let message = '';
    for (const id of selected) {
      const res = await fetch(`/api/admin/coupons`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId: id, isActive: true, startsAt: pendingActivation.start, expiresAt: pendingActivation.end })
      });
      if (!res.ok) success = false;
    }
    setCoupons(prev => prev.map(c =>
      selected.includes(c.id)
        ? { ...c, isActive: true, startsAt: pendingActivation.start, expiresAt: pendingActivation.end }
        : c
    ));
    setSelected([]);
    setPendingActivation(null);
    setShowFinalConfirm(false);
    message = success ? `Activated ${selected.length} coupon(s).` : 'Some coupons could not be activated.';
    setToast({ message, type: success ? 'success' : 'error' });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="space-y-8">
      {toast && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {toast.message}
        </div>
      )}
      <AdminPageHeader
        title="Discount Codes"
        breadcrumb={[{ label: "Discount Codes", href: "/admin/coupons" }]}
        actions={
          <>
            <Button size="sm" className="gap-2" onClick={() => setNewDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Create New Coupon
            </Button>
            <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Coupon</DialogTitle>
                </DialogHeader>
                <NewCouponForm onSuccess={() => { setNewDialogOpen(false); fetchCoupons(); }} />
              </DialogContent>
            </Dialog>
          </>
        }
        toolbar={
          <div className="flex w-full items-center justify-between gap-4">
            {/* Search */}
            <Input
              name="q"
              placeholder="Search by code, type, or status"
              className="pl-4"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
            />
            {/* Filters */}
            <select className="h-9 rounded-md border border-brand-umber/20 bg-white px-3 text-sm text-brand-umber" name="status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select className="h-9 rounded-md border border-brand-umber/20 bg-white px-3 text-sm text-brand-umber" name="type" value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
          </div>
        }
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Discount Codes</CardTitle>
          <div className="flex flex-wrap gap-8 items-center">
            <div>Total Codes: <b>{usageStats?._count?.id ?? 0}</b></div>
            <div>Total Uses: <b>{usageStats?._sum?.usedCount ?? 0}</b></div>
          </div>
          {/* Bulk actions */}
          {selected.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleBulkActivate(true)}>Activate</Button>
              <Button size="sm" onClick={() => handleBulkActivate(false)}>Deactivate</Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete</Button>
            </div>
          )}
              {/* Final confirmation dialog for activation with dates */}
              <Dialog open={showFinalConfirm} onOpenChange={open => { if (!open) setShowFinalConfirm(false); }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Activation</DialogTitle>
                  </DialogHeader>
                  <div>
                    Are you sure you want to activate {selected.length} coupon(s) with the following dates?
                    <div className="mt-2 text-sm">
                      <b>Valid From:</b> {pendingActivation?.start || '-'}<br />
                      <b>Valid To:</b> {pendingActivation?.end || '-'}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => { setShowFinalConfirm(false); setPendingActivation(null); }}>Cancel</Button>
                    <Button onClick={confirmBulkActivateWithDates}>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-2 py-4"><input type="checkbox" checked={selected.length === coupons.length && coupons.length > 0} onChange={handleSelectAll} /></th>
                <th className="px-6 py-4 text-left text-xs cursor-pointer" onClick={() => { setSort("code"); setOrder(order === "asc" ? "desc" : "asc"); }}>Code</th>
                <th className="px-6 py-4 text-left text-xs cursor-pointer" onClick={() => { setSort("type"); setOrder(order === "asc" ? "desc" : "asc"); }}>Type</th>
                <th className="px-6 py-4 text-left text-xs cursor-pointer" onClick={() => { setSort("value"); setOrder(order === "asc" ? "desc" : "asc"); }}>Value</th>
                <th className="px-6 py-4 text-left text-xs cursor-pointer" onClick={() => { setSort("isActive"); setOrder(order === "asc" ? "desc" : "asc"); }}>Status</th>
                <th className="px-6 py-4 text-left text-xs cursor-pointer" onClick={() => { setSort("usedCount"); setOrder(order === "asc" ? "desc" : "asc"); }}>Usage</th>
                <th className="px-6 py-4 text-left text-xs cursor-pointer" onClick={() => { setSort("startsAt"); setOrder(order === "asc" ? "desc" : "asc"); }}>Valid From</th>
                <th className="px-6 py-4 text-left text-xs cursor-pointer" onClick={() => { setSort("expiresAt"); setOrder(order === "asc" ? "desc" : "asc"); }}>Valid To</th>
                <th className="px-6 py-4 text-left text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b last:border-b-0">
                  <td className="px-2 py-4"><input type="checkbox" checked={selected.includes(coupon.id)} onChange={() => handleSelect(coupon.id)} /></td>
                  <td className="px-6 py-4 cursor-pointer underline" onClick={() => setDetailsCoupon(coupon)}>{coupon.code}</td>
                  <td className="px-6 py-4">{coupon.type}</td>
                  <td className="px-6 py-4">{coupon.value}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      const now = new Date();
                      const startsAt = coupon.startsAt ? new Date(coupon.startsAt) : null;
                      const expiresAt = coupon.expiresAt ? new Date(coupon.expiresAt) : null;
                      const isActive = coupon.isActive &&
                        (!startsAt || now >= startsAt) &&
                        (!expiresAt || now <= expiresAt);
                      if (!isActive) {
                        return (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> Inactive
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500" /> Active
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">{coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}</td>
                  <td className="px-6 py-4">{coupon.startsAt ? new Date(coupon.startsAt as string).toLocaleDateString() : "-"}</td>
                  <td className="px-6 py-4">{coupon.expiresAt ? new Date(coupon.expiresAt as string).toLocaleDateString() : "-"}</td>
                  <td className="px-6 py-4">
                    <RowActions
                      editHref={`/admin/coupons/${coupon.id}/edit`}
                      viewHref="#"
                      viewLinkProps={{ onClick: (e: any) => { e.preventDefault(); setDetailsCoupon(coupon); } }}
                      deleteConfig={{
                        action: async () => {
                          const res = await fetch("/api/admin/coupons", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ couponId: coupon.id })
                          })
                          fetchCoupons()
                          const message = res.ok ? `Deleted coupon ${coupon.code}.` : `Failed to delete coupon ${coupon.code}.`
                          setToast({ message, type: res.ok ? "success" : "error" })
                          if (toastTimeout.current) clearTimeout(toastTimeout.current)
                          toastTimeout.current = setTimeout(() => setToast(null), 3000)
                        },
                        fields: {},
                        resourceLabel: `coupon ${coupon.code}`,
                        confirmTitle: "Delete coupon?",
                        confirmDescription: `This will permanently remove coupon ${coupon.code}.`,
                        confirmButtonLabel: "Delete"
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                className="rounded-md border border-border bg-transparent px-2 py-1 text-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <span>
                {page}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Details Modal */}
      <Dialog open={!!detailsCoupon} onOpenChange={open => { if (!open) setDetailsCoupon(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coupon Details</DialogTitle>
          </DialogHeader>
          {detailsCoupon && (
            <div className="space-y-2">
              <div><b>Code:</b> {detailsCoupon.code}</div>
              <div><b>Description:</b> {detailsCoupon.description || "-"}</div>
              <div><b>Type:</b> {detailsCoupon.type}</div>
              <div><b>Value:</b> {detailsCoupon.value}</div>
              <div><b>Status:</b> {detailsCoupon.isActive ? "Active" : "Inactive"}</div>
              <div><b>Usage:</b> {detailsCoupon.usedCount}{detailsCoupon.maxUses ? " / " + detailsCoupon.maxUses : ""}</div>
              <div><b>Valid From:</b> {detailsCoupon.startsAt ? new Date(detailsCoupon.startsAt as string).toLocaleDateString() : "-"}</div>
              <div><b>Valid To:</b> {detailsCoupon.expiresAt ? new Date(detailsCoupon.expiresAt as string).toLocaleDateString() : "-"}</div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsCoupon(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog */}
      {/* Activation Timing Dialog */}
      <Dialog open={timingDialog.open} onOpenChange={open => { if (!open) setTimingDialog({ ...timingDialog, open: false }); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Activation Timing</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const start = (form.elements.namedItem("startsAt") as HTMLInputElement).value;
            const end = (form.elements.namedItem("expiresAt") as HTMLInputElement).value;
            if (timingDialog.onConfirm) timingDialog.onConfirm(start, end);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input name="startsAt" type="date" className="w-full border rounded px-2 py-1" defaultValue={timingDialog.defaultStart || ""} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input name="expiresAt" type="date" className="w-full border rounded px-2 py-1" defaultValue={timingDialog.defaultEnd || ""} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setTimingDialog({ ...timingDialog, open: false })}>Cancel</Button>
              <Button type="submit">Activate</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
