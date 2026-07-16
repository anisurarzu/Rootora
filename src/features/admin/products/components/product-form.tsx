"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  type Resolver,
} from "react-hook-form";
import { toast } from "sonner";
import { Eye, Loader2, Save } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
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
import { Switch } from "@/components/ui/switch";
import {
  createProduct,
  updateProduct,
} from "@/features/admin/actions/products";
import {
  CheckboxField,
  FormField,
} from "@/features/admin/products/components/form-field";
import { MediaUploader, SingleMediaField } from "@/features/admin/products/components/media-uploader";
import { RichTextField } from "@/features/admin/products/components/rich-text-field";
import { SectionCard } from "@/features/admin/products/components/section-card";
import { TagInput } from "@/features/admin/products/components/tag-input";
import { UnsavedChangesGuard } from "@/features/admin/products/components/unsaved-changes-guard";
import { VariantEditor } from "@/features/admin/products/components/variant-editor";
import {
  emptyProductFormValues,
  productFormSchema,
  type ProductFormValues,
} from "@/features/admin/products/schema";
import { slugify } from "@/lib/utils";

type Option = { id: string; name: string; slug?: string };

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  defaultValues?: ProductFormValues;
  categories: Option[];
  farmers: Option[];
};

const OPEN_SECTIONS = [
  "basic",
  "category",
  "pricing",
  "inventory",
  "images",
  "variants",
  "shipping",
  "organic",
  "farmer",
  "origin",
  "nutrition",
  "sweet",
  "seo",
  "labels",
];

export function ProductForm({
  mode,
  productId,
  defaultValues,
  categories,
  farmers,
}: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [slugLocked, setSlugLocked] = useState(mode === "edit");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutosave = useRef("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormValues>,
    defaultValues: defaultValues ?? emptyProductFormValues,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form;

  const name = watch("name");
  const status = watch("status");

  useEffect(() => {
    if (!slugLocked && name) {
      setValue("slug", slugify(name), { shouldValidate: true });
    }
  }, [name, slugLocked, setValue]);

  useEffect(() => {
    if (mode !== "edit" || !productId) return;

    const subscription = watch((values) => {
      if (!isDirty) return;
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

      autosaveTimer.current = setTimeout(() => {
        const payload = JSON.stringify(values);
        if (payload === lastAutosave.current) return;

        startTransition(async () => {
          const result = await updateProduct(productId, {
            ...values,
            status: "DRAFT",
          }, { asDraft: true });

          if (result.success) {
            lastAutosave.current = payload;
            toast.message("Draft autosaved");
          }
        });
      }, 2500);
    });

    return () => {
      subscription.unsubscribe();
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [isDirty, mode, productId, watch]);

  const farmerOptions = useMemo(() => farmers, [farmers]);

  function onSubmit(
    values: ProductFormValues,
    nextStatus?: ProductFormValues["status"]
  ) {
    const payload = {
      ...values,
      status: nextStatus ?? values.status,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProduct(payload)
          : await updateProduct(productId!, payload);

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            form.setError(key as keyof ProductFormValues, {
              message: messages[0],
            });
          });
        }
        toast.error(result.error);
        return;
      }

      toast.success(result.message || "Saved");
      form.reset(payload);

      if (mode === "create" && result.data?.id) {
        router.push(`/admin/products/${result.data.id}/edit`);
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  return (
    <FormProvider {...form}>
      <UnsavedChangesGuard when={isDirty && !pending} />

      <form
        onSubmit={handleSubmit((values) => onSubmit(values))}
        className="space-y-6"
      >
        <div className="sticky top-0 z-20 -mx-1 flex flex-col gap-3 rounded-xl border border-border bg-surface/95 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-button text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {mode === "create" ? "New product" : "Edit product"}
            </p>
            <p className="font-heading text-xl font-semibold text-heading">
              {name || "Untitled product"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {productId ? (
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href={`/admin/products/${productId}/preview`} target="_blank">
                  <Eye className="h-4 w-4" />
                  Preview
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={handleSubmit((values) => onSubmit(values, "DRAFT"))}
            >
              Save draft
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={handleSubmit((values) =>
                onSubmit(values, "PUBLISHED")
              )}
            >
              Publish
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <Accordion
          type="multiple"
          defaultValue={OPEN_SECTIONS}
          className="space-y-4"
        >
          <SectionCard
            value="basic"
            title="1. Basic Information"
            description="Name, content, type, and visibility flags."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Product name"
                htmlFor="name"
                required
                error={errors.name?.message}
                className="md:col-span-2"
              >
                <Input id="name" {...register("name")} />
              </FormField>

              <FormField
                label="Slug"
                htmlFor="slug"
                required
                hint={
                  slugLocked
                    ? "Auto-generation locked. Edit freely or unlock."
                    : "Auto-generated from the product name."
                }
                error={errors.slug?.message}
              >
                <div className="flex gap-2">
                  <Input id="slug" {...register("slug")} />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSlugLocked((prev) => !prev)}
                  >
                    {slugLocked ? "Unlock" : "Lock"}
                  </Button>
                </div>
              </FormField>

              <FormField label="Product type" htmlFor="productType">
                <Select
                  value={watch("productType") || "physical"}
                  onValueChange={(value) =>
                    setValue("productType", value, { shouldDirty: true })
                  }
                >
                  <SelectTrigger id="productType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                    <SelectItem value="sweet">Sweet / Fresh</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Product status" htmlFor="status">
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setValue("status", value as ProductFormValues["status"], {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Short description"
                htmlFor="shortDescription"
                className="md:col-span-2"
              >
                <Textarea
                  id="shortDescription"
                  rows={2}
                  {...register("shortDescription")}
                />
              </FormField>

              <FormField
                label="Full description"
                htmlFor="description"
                required
                error={errors.description?.message}
                className="md:col-span-2"
              >
                <RichTextField
                  id="description"
                  value={watch("description")}
                  onChange={(value) =>
                    setValue("description", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  placeholder="Write the full product description…"
                />
              </FormField>

              <FormField
                label="Product story"
                htmlFor="productStory"
                className="md:col-span-2"
              >
                <RichTextField
                  id="productStory"
                  value={watch("productStory") || ""}
                  onChange={(value) =>
                    setValue("productStory", value, { shouldDirty: true })
                  }
                  rows={5}
                  placeholder="Tell the story behind this product…"
                />
              </FormField>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <CheckboxField
                id="featured"
                label="Featured product"
                checked={watch("featured")}
                onCheckedChange={(checked) =>
                  setValue("featured", checked, { shouldDirty: true })
                }
              />
              <CheckboxField
                id="trending"
                label="Trending product"
                checked={watch("trending")}
                onCheckedChange={(checked) =>
                  setValue("trending", checked, { shouldDirty: true })
                }
              />
              <CheckboxField
                id="bestSeller"
                label="Best seller"
                checked={watch("bestSeller")}
                onCheckedChange={(checked) =>
                  setValue("bestSeller", checked, { shouldDirty: true })
                }
              />
              <CheckboxField
                id="todaysDeal"
                label="Today's deal"
                checked={watch("todaysDeal")}
                onCheckedChange={(checked) =>
                  setValue("todaysDeal", checked, { shouldDirty: true })
                }
              />
              <CheckboxField
                id="newArrival"
                label="New arrival"
                checked={watch("newArrival")}
                onCheckedChange={(checked) =>
                  setValue("newArrival", checked, { shouldDirty: true })
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            value="category"
            title="2. Category"
            description="Organize catalog placement and branding."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Category"
                required
                error={errors.categoryId?.message}
              >
                <Select
                  value={watch("categoryId") || undefined}
                  onValueChange={(value) =>
                    setValue("categoryId", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Sub category" htmlFor="subcategory">
                <Input id="subcategory" {...register("subcategory")} />
              </FormField>
              <FormField label="Child category" htmlFor="childCategory">
                <Input id="childCategory" {...register("childCategory")} />
              </FormField>
              <FormField label="Collection" htmlFor="collection">
                <Input id="collection" {...register("collection")} />
              </FormField>
              <FormField label="Brand" htmlFor="brand">
                <Input id="brand" {...register("brand")} />
              </FormField>
              <FormField label="Tags" className="md:col-span-2">
                <TagInput
                  value={watch("tags") || []}
                  onChange={(tags) =>
                    setValue("tags", tags, { shouldDirty: true })
                  }
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            value="pricing"
            title="3. Pricing"
            description="Regular, sale, wholesale, tax, and discounts."
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                label="Regular price"
                htmlFor="price"
                required
                error={errors.price?.message}
              >
                <Input id="price" type="number" min={0} step="0.01" {...register("price")} />
              </FormField>
              <FormField label="Sale price" htmlFor="salePrice">
                <Input id="salePrice" type="number" min={0} step="0.01" {...register("salePrice")} />
              </FormField>
              <FormField label="Cost price" htmlFor="costPrice">
                <Input id="costPrice" type="number" min={0} step="0.01" {...register("costPrice")} />
              </FormField>
              <FormField label="Wholesale price" htmlFor="wholesalePrice">
                <Input id="wholesalePrice" type="number" min={0} step="0.01" {...register("wholesalePrice")} />
              </FormField>
              <FormField label="Tax (%)" htmlFor="tax">
                <Input id="tax" type="number" min={0} step="0.01" {...register("tax")} />
              </FormField>
              <FormField label="Discount type" htmlFor="discountType">
                <Select
                  value={watch("discountType") || "none"}
                  onValueChange={(value) =>
                    setValue("discountType", value === "none" ? "" : value, {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="discountType">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Discount amount" htmlFor="discountAmount">
                <Input
                  id="discountAmount"
                  type="number"
                  min={0}
                  step="0.01"
                  {...register("discountAmount")}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            value="inventory"
            title="4. Inventory"
            description="SKU, stock, dimensions, and order limits."
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormField label="SKU" htmlFor="sku">
                <Input id="sku" {...register("sku")} />
              </FormField>
              <FormField label="Barcode" htmlFor="barcode">
                <Input id="barcode" {...register("barcode")} />
              </FormField>
              <FormField label="Stock quantity" htmlFor="stockCount">
                <Input id="stockCount" type="number" min={0} {...register("stockCount")} />
              </FormField>
              <FormField label="Stock status">
                <Select
                  value={watch("stockStatus") || "in_stock"}
                  onValueChange={(value) =>
                    setValue("stockStatus", value, { shouldDirty: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In stock</SelectItem>
                    <SelectItem value="low_stock">Low stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of stock</SelectItem>
                    <SelectItem value="preorder">Pre-order</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Low stock alert" htmlFor="lowStockAlert">
                <Input id="lowStockAlert" type="number" min={0} {...register("lowStockAlert")} />
              </FormField>
              <FormField label="Minimum order qty" htmlFor="minOrderQty">
                <Input id="minOrderQty" type="number" min={1} {...register("minOrderQty")} />
              </FormField>
              <FormField label="Maximum order qty" htmlFor="maxOrderQty">
                <Input id="maxOrderQty" type="number" min={1} {...register("maxOrderQty")} />
              </FormField>
              <FormField label="Weight" htmlFor="weight">
                <Input id="weight" type="number" min={0} step="0.001" {...register("weight")} />
              </FormField>
              <FormField label="Unit" htmlFor="unit">
                <Input id="unit" placeholder="kg, g, pcs, L" {...register("unit")} />
              </FormField>
              <FormField label="Length" htmlFor="length">
                <Input id="length" type="number" min={0} step="0.01" {...register("length")} />
              </FormField>
              <FormField label="Width" htmlFor="width">
                <Input id="width" type="number" min={0} step="0.01" {...register("width")} />
              </FormField>
              <FormField label="Height" htmlFor="height">
                <Input id="height" type="number" min={0} step="0.01" {...register("height")} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            value="images"
            title="5. Product Images"
            description="Thumbnail, gallery, hover image, and video."
          >
            <div className="space-y-6">
              <FormField label="Main thumbnail">
                <SingleMediaField
                  label="Thumbnail"
                  value={watch("thumbnail") || ""}
                  onChange={(url) => {
                    setValue("thumbnail", url, { shouldDirty: true });
                    const images = watch("images") || [];
                    if (url && !images.includes(url)) {
                      setValue("images", [url, ...images], { shouldDirty: true });
                    }
                  }}
                />
              </FormField>
              <FormField label="Gallery images">
                <MediaUploader
                  value={watch("images") || []}
                  onChange={(urls) => {
                    setValue("images", urls, { shouldDirty: true });
                    if (urls[0]) {
                      setValue("thumbnail", urls[0], { shouldDirty: true });
                    }
                  }}
                />
              </FormField>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Hover image">
                  <SingleMediaField
                    label="Hover image"
                    value={watch("hoverImage") || ""}
                    onChange={(url) =>
                      setValue("hoverImage", url, { shouldDirty: true })
                    }
                  />
                </FormField>
                <FormField label="Product video URL" htmlFor="videoUrl">
                  <Input
                    id="videoUrl"
                    placeholder="https://… or upload below"
                    {...register("videoUrl")}
                  />
                  <div className="mt-3">
                    <SingleMediaField
                      label="Video"
                      value={watch("videoUrl") || ""}
                      onChange={(url) =>
                        setValue("videoUrl", url, { shouldDirty: true })
                      }
                    />
                  </div>
                </FormField>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            value="variants"
            title="6. Product Variants"
            description="Color, size, weight, packaging, flavor, and custom."
          >
            <VariantEditor />
          </SectionCard>

          <SectionCard
            value="shipping"
            title="7. Shipping"
            description="Delivery options, charges, and returns."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Delivery time" htmlFor="deliveryTime">
                <Input id="deliveryTime" placeholder="1–3 business days" {...register("deliveryTime")} />
              </FormField>
              <FormField label="Shipping class" htmlFor="shippingClass">
                <Input id="shippingClass" {...register("shippingClass")} />
              </FormField>
              <FormField label="Shipping charge" htmlFor="shippingCharge">
                <Input id="shippingCharge" type="number" min={0} step="0.01" {...register("shippingCharge")} />
              </FormField>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["codAvailable", "COD available"],
                ["freeShipping", "Free shipping"],
                ["returnAvailable", "Return available"],
                ["replacementAvailable", "Replacement available"],
              ].map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-3"
                >
                  <span className="font-button text-sm">{label}</span>
                  <Switch
                    checked={Boolean(watch(key as keyof ProductFormValues))}
                    onCheckedChange={(checked) =>
                      setValue(key as keyof ProductFormValues, checked as never, {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            value="organic"
            title="8. Organic Information"
            description="Certification, harvest, and storage details."
          >
            <div className="mb-4">
              <CheckboxField
                id="organic"
                label="Organic certified"
                checked={watch("organic")}
                onCheckedChange={(checked) =>
                  setValue("organic", checked, { shouldDirty: true })
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Certificate number" htmlFor="certificateNumber">
                <Input id="certificateNumber" {...register("certificateNumber")} />
              </FormField>
              <FormField label="Harvest date" htmlFor="harvestDate">
                <Input id="harvestDate" type="date" {...register("harvestDate")} />
              </FormField>
              <FormField label="Expiry date" htmlFor="expiryDate">
                <Input id="expiryDate" type="date" {...register("expiryDate")} />
              </FormField>
              <FormField label="Best before" htmlFor="bestBefore">
                <Input id="bestBefore" type="date" {...register("bestBefore")} />
              </FormField>
              <FormField
                label="Storage instruction"
                htmlFor="storageInstruction"
                className="md:col-span-2"
              >
                <Textarea id="storageInstruction" rows={3} {...register("storageInstruction")} />
              </FormField>
              <FormField label="Certificate upload" className="md:col-span-2">
                <SingleMediaField
                  label="Certificate"
                  value={watch("certificateUrl") || ""}
                  onChange={(url) =>
                    setValue("certificateUrl", url, { shouldDirty: true })
                  }
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            value="farmer"
            title="9. Farmer Information"
            description="Link to a farmer and farm storytelling."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Farmer">
                <Select
                  value={watch("farmerId") || "none"}
                  onValueChange={(value) => {
                    const farmerId = value === "none" ? "" : value;
                    setValue("farmerId", farmerId, { shouldDirty: true });
                    const farmer = farmerOptions.find((item) => item.id === farmerId);
                    if (farmer) {
                      setValue("farmName", farmer.name, { shouldDirty: true });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No farmer linked</SelectItem>
                    {farmerOptions.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Farm name" htmlFor="farmName">
                <Input id="farmName" {...register("farmName")} />
              </FormField>
              <FormField label="District" htmlFor="farmerDistrict">
                <Input id="farmerDistrict" {...register("farmerDistrict")} />
              </FormField>
              <FormField label="Upazila" htmlFor="farmerUpazila">
                <Input id="farmerUpazila" {...register("farmerUpazila")} />
              </FormField>
              <FormField
                label="Village"
                htmlFor="origin"
                hint="Village stored in origin when not using a dedicated village field."
              >
                <Input id="origin" placeholder="Village / locality" {...register("origin")} />
              </FormField>
              <FormField
                label="Farm story"
                htmlFor="farmStory"
                className="md:col-span-2"
              >
                <Textarea id="farmStory" rows={4} {...register("farmStory")} />
              </FormField>
              <FormField label="Farm images" className="md:col-span-2">
                <MediaUploader
                  value={watch("farmImages") || []}
                  onChange={(urls) =>
                    setValue("farmImages", urls, { shouldDirty: true })
                  }
                  maxFiles={8}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            value="origin"
            title="10. Origin"
            description="Geographic origin and map coordinates."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Country" htmlFor="country">
                <Input id="country" {...register("country")} />
              </FormField>
              <FormField label="District" htmlFor="originDistrict">
                <Input id="originDistrict" {...register("originDistrict")} />
              </FormField>
              <FormField label="Origin badge" htmlFor="originBadge">
                <Input id="originBadge" placeholder="Rajshahi Mango" {...register("originBadge")} />
              </FormField>
              <FormField label="Latitude" htmlFor="latitude">
                <Input id="latitude" type="number" step="any" {...register("latitude")} />
              </FormField>
              <FormField label="Longitude" htmlFor="longitude">
                <Input id="longitude" type="number" step="any" {...register("longitude")} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            value="nutrition"
            title="11. Nutrition"
            description="Macros, ingredients, and allergens."
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                ["calories", "Calories"],
                ["protein", "Protein"],
                ["fat", "Fat"],
                ["carbohydrate", "Carbohydrate"],
                ["sugar", "Sugar"],
                ["fiber", "Fiber"],
              ].map(([key, label]) => (
                <FormField key={key} label={label} htmlFor={key}>
                  <Input
                    id={key}
                    {...register(key as keyof ProductFormValues)}
                  />
                </FormField>
              ))}
              <FormField label="Ingredients" className="md:col-span-2 lg:col-span-3">
                <TagInput
                  value={watch("ingredients") || []}
                  onChange={(items) =>
                    setValue("ingredients", items, { shouldDirty: true })
                  }
                  placeholder="Add ingredient"
                />
              </FormField>
              <FormField label="Allergens" className="md:col-span-2 lg:col-span-3">
                <TagInput
                  value={watch("allergens") || []}
                  onChange={(items) =>
                    setValue("allergens", items, { shouldDirty: true })
                  }
                  placeholder="Add allergen"
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            value="sweet"
            title="12. Sweet Products"
            description="Shelf life and refrigeration for sweets."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Shelf life" htmlFor="shelfLife">
                <Input id="shelfLife" {...register("shelfLife")} />
              </FormField>
              <FormField label="Made date" htmlFor="madeDate">
                <Input id="madeDate" type="date" {...register("madeDate")} />
              </FormField>
              <FormField label="Sweet category" htmlFor="sweetCategory">
                <Input id="sweetCategory" {...register("sweetCategory")} />
              </FormField>
              <FormField label="Delivery area" htmlFor="deliveryArea">
                <Input id="deliveryArea" {...register("deliveryArea")} />
              </FormField>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
                <span className="font-button text-sm">Freshly made</span>
                <Switch
                  checked={watch("freshlyMade")}
                  onCheckedChange={(checked) =>
                    setValue("freshlyMade", checked, { shouldDirty: true })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
                <span className="font-button text-sm">Keep refrigerated</span>
                <Switch
                  checked={watch("keepRefrigerated")}
                  onCheckedChange={(checked) =>
                    setValue("keepRefrigerated", checked, { shouldDirty: true })
                  }
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            value="seo"
            title="13. SEO"
            description="Search and social sharing metadata."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="SEO title" htmlFor="seoTitle" className="md:col-span-2">
                <Input id="seoTitle" {...register("seoTitle")} />
              </FormField>
              <FormField
                label="SEO description"
                htmlFor="seoDescription"
                className="md:col-span-2"
              >
                <Textarea id="seoDescription" rows={3} {...register("seoDescription")} />
              </FormField>
              <FormField label="SEO keywords" htmlFor="seoKeywords">
                <Input id="seoKeywords" {...register("seoKeywords")} />
              </FormField>
              <FormField label="Canonical URL" htmlFor="canonicalUrl">
                <Input id="canonicalUrl" {...register("canonicalUrl")} />
              </FormField>
              <FormField label="OG image" className="md:col-span-2">
                <SingleMediaField
                  label="OG image"
                  value={watch("ogImage") || ""}
                  onChange={(url) =>
                    setValue("ogImage", url, { shouldDirty: true })
                  }
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            value="labels"
            title="14. Product Labels"
            description="Merchandising badges shown across the storefront."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["featured", "Featured"],
                ["trending", "Trending"],
                ["organic", "Organic"],
                ["limitedEdition", "Limited edition"],
                ["seasonal", "Seasonal"],
                ["imported", "Imported"],
                ["local", "Local"],
                ["freshToday", "Fresh today"],
              ].map(([key, label]) => (
                <CheckboxField
                  key={key}
                  id={`label-${key}`}
                  label={label}
                  checked={Boolean(watch(key as keyof ProductFormValues))}
                  onCheckedChange={(checked) =>
                    setValue(key as keyof ProductFormValues, checked as never, {
                      shouldDirty: true,
                    })
                  }
                />
              ))}
            </div>
          </SectionCard>
        </Accordion>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save product"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
