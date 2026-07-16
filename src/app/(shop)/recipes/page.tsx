import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { recipes } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Healthy Bangladeshi recipes using ROOTORA premium ingredients — from mango salads to Kalijira khichuri and artisan tea lattes.",
};

export default function RecipesPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="In the Kitchen"
          title="Healthy Recipes"
          description="Celebrate Bangladeshi culinary heritage with recipes crafted from our farm-fresh, organic ingredients."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <article
              key={recipe.id}
              className="group overflow-hidden rounded-xl border border-border bg-surface shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <Link href={`/recipes/${recipe.slug}`}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <Badge
                    variant="outline"
                    className="absolute left-4 top-4 bg-surface/90 backdrop-blur-sm"
                  >
                    {recipe.difficulty}
                  </Badge>
                </div>

                <div className="p-6">
                  <h2 className="font-heading text-xl font-semibold text-heading transition-colors group-hover:text-primary">
                    {recipe.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {recipe.description}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {recipe.prepTime + recipe.cookTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {recipe.servings} servings
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
