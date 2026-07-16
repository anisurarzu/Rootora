export const PERMISSIONS = [
  {
    key: "admin.access",
    name: "Access admin panel",
    module: "Admin",
    description: "Can open the admin area",
  },
  {
    key: "dashboard.view",
    name: "View dashboard",
    module: "Admin",
    description: "Can view admin dashboard metrics",
  },
  {
    key: "products.view",
    name: "View products",
    module: "Products",
    description: "Can view the product list",
  },
  {
    key: "products.create",
    name: "Create products",
    module: "Products",
    description: "Can create new products",
  },
  {
    key: "products.edit",
    name: "Edit products",
    module: "Products",
    description: "Can edit existing products",
  },
  {
    key: "products.delete",
    name: "Delete products",
    module: "Products",
    description: "Can delete products",
  },
  {
    key: "products.publish",
    name: "Publish products",
    module: "Products",
    description: "Can publish, archive, or draft products",
  },
  {
    key: "orders.view",
    name: "View orders",
    module: "Orders",
    description: "Can view orders",
  },
  {
    key: "orders.manage",
    name: "Manage orders",
    module: "Orders",
    description: "Can update order status",
  },
  {
    key: "customers.view",
    name: "View customers",
    module: "Customers",
    description: "Can view customer accounts",
  },
  {
    key: "customers.manage",
    name: "Manage customers",
    module: "Customers",
    description: "Can update customer accounts",
  },
  {
    key: "categories.view",
    name: "View categories",
    module: "Categories",
    description: "Can view categories",
  },
  {
    key: "categories.manage",
    name: "Manage categories",
    module: "Categories",
    description: "Can create and edit categories",
  },
  {
    key: "farmers.view",
    name: "View farmers",
    module: "Farmers",
    description: "Can view farmer profiles",
  },
  {
    key: "farmers.manage",
    name: "Manage farmers",
    module: "Farmers",
    description: "Can create and edit farmers",
  },
  {
    key: "roles.view",
    name: "View roles",
    module: "Roles",
    description: "Can view roles and permissions",
  },
  {
    key: "roles.manage",
    name: "Manage roles",
    module: "Roles",
    description: "Can create roles and assign permissions",
  },
  {
    key: "users.manage",
    name: "Assign user roles",
    module: "Roles",
    description: "Can assign roles to users",
  },
  {
    key: "settings.manage",
    name: "Manage settings",
    module: "Settings",
    description: "Can access admin settings",
  },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const SYSTEM_ROLES = {
  ADMIN: {
    name: "Admin",
    slug: "ADMIN",
    description: "Full access to all admin features",
    permissions: PERMISSIONS.map((permission) => permission.key),
  },
  MANAGER: {
    name: "Manager",
    slug: "MANAGER",
    description: "Manage catalog, orders, and customers",
    permissions: [
      "admin.access",
      "dashboard.view",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.publish",
      "orders.view",
      "orders.manage",
      "customers.view",
      "customers.manage",
      "categories.view",
      "categories.manage",
      "farmers.view",
      "farmers.manage",
      "settings.manage",
    ] satisfies PermissionKey[],
  },
  EDITOR: {
    name: "Editor",
    slug: "EDITOR",
    description: "Create and edit products and categories",
    permissions: [
      "admin.access",
      "dashboard.view",
      "products.view",
      "products.create",
      "products.edit",
      "products.publish",
      "categories.view",
      "categories.manage",
      "farmers.view",
      "farmers.manage",
    ] satisfies PermissionKey[],
  },
  CUSTOMER: {
    name: "Customer",
    slug: "CUSTOMER",
    description: "Storefront customer account",
    permissions: [] as PermissionKey[],
  },
} as const;

export function groupPermissionsByModule(
  permissions: Array<{
    key: string;
    name: string;
    module: string;
    description?: string | null;
  }>
) {
  return permissions.reduce<
    Record<
      string,
      Array<{
        key: string;
        name: string;
        module: string;
        description?: string | null;
      }>
    >
  >((groups, permission) => {
    const moduleName = permission.module || "General";
    groups[moduleName] = groups[moduleName] ?? [];
    groups[moduleName].push(permission);
    return groups;
  }, {});
}
