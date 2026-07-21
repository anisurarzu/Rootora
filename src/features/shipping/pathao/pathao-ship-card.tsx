"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createPathaoShipmentAction,
  getPathaoAreasAction,
  getPathaoCitiesAction,
  getPathaoShippingOptions,
  getPathaoZonesAction,
  refreshPathaoShipmentAction,
} from "@/features/shipping/pathao/actions";
import type {
  PathaoArea,
  PathaoCity,
  PathaoStore,
  PathaoZone,
} from "@/features/shipping/pathao/client";
import { formatPrice } from "@/lib/utils";

type PathaoShipCardProps = {
  orderId: string;
  districtHint?: string;
  pathaoConsignmentId: string | null;
  pathaoStatus: string | null;
  pathaoDeliveryFee: number | null;
  canManage: boolean;
};

export function PathaoShipCard({
  orderId,
  districtHint,
  pathaoConsignmentId,
  pathaoStatus,
  pathaoDeliveryFee,
  canManage,
}: PathaoShipCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [configured, setConfigured] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [stores, setStores] = useState<PathaoStore[]>([]);
  const [cities, setCities] = useState<PathaoCity[]>([]);
  const [zones, setZones] = useState<PathaoZone[]>([]);
  const [areas, setAreas] = useState<PathaoArea[]>([]);
  const [storeId, setStoreId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [zoneId, setZoneId] = useState<string>("");
  const [areaId, setAreaId] = useState<string>("");
  const [weight, setWeight] = useState("0.5");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!canManage || pathaoConsignmentId) return;
    let cancelled = false;

    async function boot() {
      const options = await getPathaoShippingOptions();
      if (cancelled) return;
      setConfigured(options.configured);
      setBootError(options.error);
      setStores(options.stores);
      if (options.defaultStoreId) {
        setStoreId(String(options.defaultStoreId));
      }

      if (!options.configured) return;

      try {
        const cityList = await getPathaoCitiesAction();
        if (cancelled) return;
        setCities(cityList);

        const hint = districtHint?.trim().toLowerCase();
        if (hint) {
          const match = cityList.find((city) =>
            city.city_name.toLowerCase().includes(hint),
          );
          if (match) setCityId(String(match.city_id));
        }
      } catch (error) {
        if (!cancelled) {
          setBootError(
            error instanceof Error ? error.message : "Failed to load cities",
          );
        }
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [canManage, pathaoConsignmentId, districtHint]);

  useEffect(() => {
    if (!cityId) {
      setZones([]);
      setZoneId("");
      setAreas([]);
      setAreaId("");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const zoneList = await getPathaoZonesAction(Number(cityId));
        if (cancelled) return;
        setZones(zoneList);
        setZoneId("");
        setAreas([]);
        setAreaId("");
      } catch {
        if (!cancelled) setZones([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cityId]);

  useEffect(() => {
    if (!zoneId) {
      setAreas([]);
      setAreaId("");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const areaList = await getPathaoAreasAction(Number(zoneId));
        if (cancelled) return;
        setAreas(areaList);
        setAreaId("");
      } catch {
        if (!cancelled) setAreas([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [zoneId]);

  function handleCreate() {
    startTransition(async () => {
      const result = await createPathaoShipmentAction({
        orderId,
        storeId: Number(storeId),
        cityId: Number(cityId),
        zoneId: Number(zoneId),
        areaId: Number(areaId),
        itemWeight: Number(weight) || 0.5,
        specialInstruction: note || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Pathao shipment created (${result.consignmentId}).`);
      router.refresh();
    });
  }

  function handleRefresh() {
    startTransition(async () => {
      const result = await refreshPathaoShipmentAction(orderId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Pathao status: ${result.status}`);
      router.refresh();
    });
  }

  if (!canManage) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Pathao Courier
        </CardTitle>
        <CardDescription>
          Create a Pathao sandbox/production consignment for this order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pathaoConsignmentId ? (
          <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Consignment:</span>{" "}
              <span className="font-semibold text-heading">
                {pathaoConsignmentId}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span>{" "}
              <span className="font-medium">{pathaoStatus || "—"}</span>
            </p>
            {pathaoDeliveryFee != null ? (
              <p>
                <span className="text-muted-foreground">Pathao fee:</span>{" "}
                {formatPrice(pathaoDeliveryFee)}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={handleRefresh}
            >
              Refresh status
            </Button>
          </div>
        ) : !configured ? (
          <p className="text-sm text-muted-foreground">
            Add Pathao credentials to environment variables to enable shipping.
          </p>
        ) : (
          <div className="space-y-3">
            {bootError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {bootError}
              </p>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pickup store
              </label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem
                      key={store.store_id}
                      value={String(store.store_id)}
                    >
                      {store.store_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                City
              </label>
              <Select value={cityId} onValueChange={setCityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.city_id} value={String(city.city_id)}>
                      {city.city_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Zone
              </label>
              <Select
                value={zoneId}
                onValueChange={setZoneId}
                disabled={!cityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.zone_id} value={String(zone.zone_id)}>
                      {zone.zone_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Area
              </label>
              <Select
                value={areaId}
                onValueChange={setAreaId}
                disabled={!zoneId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.area_id} value={String(area.area_id)}>
                      {area.area_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Weight (kg)
              </label>
              <Input
                type="number"
                min={0.1}
                max={20}
                step={0.1}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rider note
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional delivery instruction"
                rows={2}
              />
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={pending || !storeId || !cityId || !zoneId || !areaId}
              onClick={handleCreate}
            >
              Create Pathao shipment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
