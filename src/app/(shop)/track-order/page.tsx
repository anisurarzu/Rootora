"use client";

import { useState } from "react";
import { Package, Search } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<"idle" | "found" | "not-found">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (orderNumber.trim().toUpperCase().startsWith("RT")) {
      setResult("found");
    } else {
      setResult("not-found");
    }
  }

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Orders"
          title="Track Your Order"
          description="Enter your order number and email to check delivery status."
        />

        <div className="mx-auto max-w-lg">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-surface p-6 shadow-soft md:p-8"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. RT-20260715-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                <Search className="h-4 w-4" />
                Track Order
              </Button>
            </div>
          </form>

          {result === "found" && (
            <div className="mt-8 rounded-xl border border-border bg-muted/30 p-6">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-heading font-semibold text-heading">
                    Order {orderNumber.toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="text-primary">In Transit</span>
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4 border-l-2 border-primary/20 pl-6">
                <div>
                  <p className="text-xs font-button uppercase tracking-wider text-muted-foreground">
                    Jul 15, 2026 — 10:30 AM
                  </p>
                  <p className="mt-1 text-sm text-heading">
                    Order confirmed and being prepared
                  </p>
                </div>
                <div>
                  <p className="text-xs font-button uppercase tracking-wider text-muted-foreground">
                    Jul 15, 2026 — 2:15 PM
                  </p>
                  <p className="mt-1 text-sm text-heading">
                    Shipped from ROOTORA warehouse, Dhaka
                  </p>
                </div>
                <div>
                  <p className="text-xs font-button uppercase tracking-wider text-primary">
                    Estimated Delivery
                  </p>
                  <p className="mt-1 text-sm font-medium text-heading">
                    Jul 16, 2026 by 6:00 PM
                  </p>
                </div>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                This is a demo tracking result. Full order tracking will be
                available when checkout launches.
              </p>
            </div>
          )}

          {result === "not-found" && (
            <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="font-heading font-medium text-heading">
                Order not found
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please check your order number and email. Demo orders start with
                &quot;RT&quot; (e.g. RT-20260715-001).
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
