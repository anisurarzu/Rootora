"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/features/admin/products/components/form-field";
import { SingleMediaField } from "@/features/admin/products/components/media-uploader";
import type { ProductFormValues } from "@/features/admin/products/schema";

const VARIANT_TYPES = [
  "Color",
  "Size",
  "Weight",
  "Packaging",
  "Flavor",
  "Custom",
] as const;

export function VariantEditor() {
  const { control, register, setValue, watch, formState } =
    useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Add color, size, weight, packaging, flavor, or custom variants.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            append({
              name: "Color",
              value: "",
              image: "",
              sku: "",
              price: null,
              salePrice: null,
              stockCount: 0,
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add variant
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No variants yet. Customers will purchase the base product.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const name = watch(`variants.${index}.name`);
            return (
              <div
                key={field.id}
                className="rounded-xl border border-border bg-muted/20 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-button text-sm font-semibold text-heading">
                    Variant {index + 1}
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Variant type"
                    error={formState.errors.variants?.[index]?.name?.message}
                  >
                    <Select
                      value={name || "Custom"}
                      onValueChange={(value) =>
                        setValue(`variants.${index}.name`, value, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VARIANT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label="Value"
                    htmlFor={`variant-value-${index}`}
                    required
                    error={formState.errors.variants?.[index]?.value?.message}
                  >
                    <Input
                      id={`variant-value-${index}`}
                      placeholder="e.g. Red, 500g, Large"
                      {...register(`variants.${index}.value`)}
                    />
                  </FormField>

                  <FormField label="SKU" htmlFor={`variant-sku-${index}`}>
                    <Input
                      id={`variant-sku-${index}`}
                      {...register(`variants.${index}.sku`)}
                    />
                  </FormField>

                  <FormField label="Stock" htmlFor={`variant-stock-${index}`}>
                    <Input
                      id={`variant-stock-${index}`}
                      type="number"
                      min={0}
                      {...register(`variants.${index}.stockCount`)}
                    />
                  </FormField>

                  <FormField label="Price" htmlFor={`variant-price-${index}`}>
                    <Input
                      id={`variant-price-${index}`}
                      type="number"
                      min={0}
                      step="0.01"
                      {...register(`variants.${index}.price`)}
                    />
                  </FormField>

                  <FormField
                    label="Sale price"
                    htmlFor={`variant-sale-${index}`}
                  >
                    <Input
                      id={`variant-sale-${index}`}
                      type="number"
                      min={0}
                      step="0.01"
                      {...register(`variants.${index}.salePrice`)}
                    />
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField label="Variant image">
                    <SingleMediaField
                      value={watch(`variants.${index}.image`) || ""}
                      onChange={(url) =>
                        setValue(`variants.${index}.image`, url, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </FormField>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
