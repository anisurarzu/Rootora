import { CareersAdminTabs } from "@/features/admin/components/careers-admin-tabs";
import { CareersApplicationsManager } from "@/features/admin/components/careers-applications-manager";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCareersApplicationsPage() {
  await requirePermission(["admin.access"]);

  const applications = await prisma.careerApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const newCount = applications.filter((app) => app.status === "NEW").length;

  return (
    <div>
      <header className="mb-2">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Career applications
        </h1>
        <p className="mt-2 text-muted-foreground">
          Applications from /careers
          {newCount > 0 ? ` · ${newCount} new` : ""}.
        </p>
      </header>

      <CareersAdminTabs />

      <CareersApplicationsManager
        applications={applications.map((app) => ({
          id: app.id,
          positionSlug: app.positionSlug,
          positionTitle: app.positionTitle,
          fullName: app.fullName,
          email: app.email,
          phone: app.phone,
          city: app.city,
          education: app.education,
          facebookUrl: app.facebookUrl,
          instagramUrl: app.instagramUrl,
          about: app.about,
          availability: app.availability,
          status: app.status,
          createdAt: app.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
