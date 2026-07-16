"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import {
  Archive,
  Copy,
  Eye,
  FileSpreadsheet,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/features/admin/products/components/confirm-dialog";
import {
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  deleteProduct,
  duplicateProduct,
  setProductStatus,
  type AdminProductListItem,
} from "@/features/admin/actions/products";
import { formatPrice } from "@/lib/utils";

type ProductsTableProps = {
  products: AdminProductListItem[];
  categories: { id: string; name: string }[];
};

function statusVariant(status: string) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "ARCHIVED") return "outline" as const;
  return "secondary" as const;
}

function exportRows(rows: AdminProductListItem[], format: "csv" | "excel") {
  const headers = [
    "Name",
    "SKU",
    "Category",
    "Brand",
    "Price",
    "Sale Price",
    "Stock",
    "Status",
    "Created At",
    "Updated At",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.name,
        row.sku ?? "",
        row.category.name,
        row.brand ?? "",
        row.price,
        row.salePrice ?? "",
        row.stockCount,
        row.status,
        row.createdAt,
        row.updatedAt,
      ]
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(",")
    ),
  ];

  const blob = new Blob(
    [format === "excel" ? `\uFEFF${lines.join("\n")}` : lines.join("\n")],
    {
      type:
        format === "excel"
          ? "application/vnd.ms-excel;charset=utf-8;"
          : "text/csv;charset=utf-8;",
    }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download =
    format === "excel" ? "rootora-products.xls" : "rootora-products.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [confirm, setConfirm] = useState<{
    title: string;
    description: string;
    tone?: "default" | "danger";
    action: () => Promise<void>;
  } | null>(null);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (statusFilter !== "ALL" && product.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== "ALL" && product.category.id !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [products, statusFilter, categoryFilter]);

  const columns = useMemo<ColumnDef<AdminProductListItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="h-4 w-4 rounded border-input"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.name}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-input"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => {
          const product = row.original;
          const image = product.thumbnail || product.images[0];
          return (
            <div className="flex min-w-[220px] items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized={!image.includes("res.cloudinary.com")}
                  />
                ) : null}
              </div>
              <div>
                <p className="font-medium text-heading">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.slug}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => row.original.sku || "—",
      },
      {
        id: "category",
        accessorFn: (row) => row.category.name,
        header: "Category",
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ row }) => row.original.brand || "—",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => formatPrice(row.original.price),
      },
      {
        accessorKey: "salePrice",
        header: "Sale price",
        cell: ({ row }) =>
          row.original.salePrice != null
            ? formatPrice(row.original.salePrice)
            : "—",
      },
      {
        accessorKey: "stockCount",
        header: "Stock",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const product = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/products/${product.id}/preview`}>
                    <Eye className="h-4 w-4" />
                    View / Preview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    startTransition(async () => {
                      const result = await duplicateProduct(product.id);
                      if (!result.success) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(result.message);
                      if (result.data?.id) {
                        router.push(`/admin/products/${result.data.id}/edit`);
                      }
                      router.refresh();
                    })
                  }
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    startTransition(async () => {
                      const result = await setProductStatus(
                        product.id,
                        "PUBLISHED"
                      );
                      if (!result.success) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(result.message);
                      router.refresh();
                    })
                  }
                >
                  <Upload className="h-4 w-4" />
                  Publish
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    startTransition(async () => {
                      const result = await setProductStatus(
                        product.id,
                        "ARCHIVED"
                      );
                      if (!result.success) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(result.message);
                      router.refresh();
                    })
                  }
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() =>
                    setConfirm({
                      title: "Delete product?",
                      description: `This will permanently delete “${product.name}”.`,
                      tone: "danger",
                      action: async () => {
                        const result = await deleteProduct(product.id);
                        if (!result.success) {
                          toast.error(result.error);
                          return;
                        }
                        toast.success(result.message);
                        setConfirm(null);
                        router.refresh();
                      },
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  function runBulk(
    title: string,
    description: string,
    action: () => Promise<void>,
    tone: "default" | "danger" = "default"
  ) {
    if (selectedIds.length === 0) {
      toast.error("Select at least one product.");
      return;
    }
    setConfirm({ title, description, action, tone });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-heading">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage catalog products, inventory, and publishing.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-soft">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Search name, SKU, brand…"
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() =>
                exportRows(
                  table.getFilteredRowModel().rows.map((row) => row.original),
                  "csv"
                )
              }
            >
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() =>
                exportRows(
                  table.getFilteredRowModel().rows.map((row) => row.original),
                  "excel"
                )
              }
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              runBulk(
                "Publish selected?",
                `Publish ${selectedIds.length} products.`,
                async () => {
                  const result = await bulkUpdateProductStatus(
                    selectedIds,
                    "PUBLISHED"
                  );
                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(result.message);
                  setRowSelection({});
                  setConfirm(null);
                  router.refresh();
                }
              )
            }
          >
            Bulk publish
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              runBulk(
                "Move to draft?",
                `Set ${selectedIds.length} products to draft.`,
                async () => {
                  const result = await bulkUpdateProductStatus(
                    selectedIds,
                    "DRAFT"
                  );
                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(result.message);
                  setRowSelection({});
                  setConfirm(null);
                  router.refresh();
                }
              )
            }
          >
            Bulk draft
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              runBulk(
                "Archive selected?",
                `Archive ${selectedIds.length} products.`,
                async () => {
                  const result = await bulkUpdateProductStatus(
                    selectedIds,
                    "ARCHIVED"
                  );
                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(result.message);
                  setRowSelection({});
                  setConfirm(null);
                  router.refresh();
                }
              )
            }
          >
            Bulk archive
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            className="text-red-600"
            onClick={() =>
              runBulk(
                "Delete selected?",
                `Permanently delete ${selectedIds.length} products.`,
                async () => {
                  const result = await bulkDeleteProducts(selectedIds);
                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(result.message);
                  setRowSelection({});
                  setConfirm(null);
                  router.refresh();
                },
                "danger"
              )
            }
          >
            Bulk delete
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-button text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={
                            header.column.getCanSort()
                              ? "inline-flex items-center gap-1"
                              : undefined
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No products found. Create your first product to get started.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} products ·{" "}
            {selectedIds.length} selected
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        tone={confirm?.tone}
        loading={pending}
        onConfirm={() =>
          startTransition(async () => {
            await confirm?.action();
          })
        }
      />
    </div>
  );
}
