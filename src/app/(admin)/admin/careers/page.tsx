import { CareersAdminTabs } from "@/features/admin/components/careers-admin-tabs";
import { CareersPostsManager } from "@/features/admin/components/careers-posts-manager";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCareersPage() {
  await requirePermission(["admin.access"]);

  const posts = await prisma.careerPost.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div>
      <header className="mb-2">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Careers
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create job posts that appear on the public careers page.
        </p>
      </header>

      <CareersAdminTabs />

      <CareersPostsManager
        posts={posts.map((post) => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          department: post.department,
          type: post.type,
          location: post.location,
          stipend: post.stipend,
          schedule: post.schedule,
          openings: post.openings,
          summary: post.summary,
          responsibilities: post.responsibilities,
          requirements: post.requirements,
          alwaysOpen: post.alwaysOpen,
          published: post.published,
          sortOrder: post.sortOrder,
          applicationCount: post._count.applications,
          createdAt: post.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
