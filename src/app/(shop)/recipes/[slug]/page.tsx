import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { getRecipeBySlug, recipes } from "@/lib/mock-data";

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

const demoIngredients: Record<string, string[]> = {
  "honey-glazed-langra-mango-salad": [
    "2 ripe Langra mangoes, peeled and cubed",
    "3 tbsp Sundarbans wild honey",
    "1 small red onion, thinly sliced",
    "Fresh mint leaves, handful",
    "Juice of 1 lime",
    "Pinch of black salt",
  ],
  "kalijira-rice-khichuri": [
    "2 cups premium Kalijira rice",
    "1 cup moong dal, soaked",
    "1 tsp turmeric powder",
    "2 tbsp organic mustard oil",
    "Whole spices: bay leaf, cinnamon, cardamom",
    "Ginger paste, green chilies, and salt to taste",
  ],
  "seven-layer-tea-latte": [
    "2 tbsp Sylhet seven-layer tea blend",
    "1 cup whole milk, steamed",
    "2 tbsp condensed milk",
    "1 tsp honey (optional)",
    "Ice cubes for serving",
  ],
};

const demoSteps: Record<string, string[]> = {
  "honey-glazed-langra-mango-salad": [
    "Combine cubed mangoes and thinly sliced red onion in a large bowl.",
    "Whisk honey, lime juice, and black salt into a light dressing.",
    "Toss the mango mixture with the dressing until evenly coated.",
    "Garnish with fresh mint leaves and serve chilled immediately.",
  ],
  "kalijira-rice-khichuri": [
    "Rinse Kalijira rice and soaked moong dal; set aside.",
    "Heat mustard oil in a heavy pot and temper whole spices until fragrant.",
    "Add ginger paste, turmeric, and green chilies; sauté briefly.",
    "Add rice and dal with 5 cups water; simmer covered until tender and creamy.",
    "Adjust salt, rest for 5 minutes, and serve hot with fried items.",
  ],
  "seven-layer-tea-latte": [
    "Brew the seven-layer tea blend in 200ml hot water for 4 minutes.",
    "Steam milk until frothy and warm, not boiling.",
    "Layer condensed milk at the bottom of a clear glass.",
    "Slowly pour brewed tea over the back of a spoon to create layers.",
    "Top with steamed milk foam and drizzle with honey if desired.",
  ],
};

export async function generateStaticParams() {
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) return { title: "Recipe Not Found" };

  return {
    title: recipe.title,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: [{ url: recipe.image }],
    },
  };
}

export default async function RecipeDetailPage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) notFound();

  const ingredients =
    demoIngredients[slug] ?? [
      "Premium ROOTORA ingredients as listed on product pages",
      "Fresh herbs and spices to taste",
      "Salt and oil as needed",
    ];

  const steps =
    demoSteps[slug] ?? [
      "Prepare all ingredients and measure quantities.",
      "Follow traditional Bengali cooking methods for best results.",
      "Taste and adjust seasoning before serving.",
      "Enjoy with family and share your creation with us!",
    ];

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <Link
          href="/recipes"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          All Recipes
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted shadow-soft lg:aspect-square">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{recipe.difficulty}</Badge>
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="mt-4 font-heading text-3xl font-semibold text-heading md:text-4xl">
              {recipe.title}
            </h1>

            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Prep {recipe.prepTime} min · Cook {recipe.cookTime} min
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {recipe.servings} servings
              </span>
            </div>

            <p className="mt-6 leading-relaxed text-muted-foreground">
              {recipe.description}
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-12 border-t border-border pt-16 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-heading">
              Ingredients
            </h2>
            <ul className="mt-6 space-y-3">
              {ingredients.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-semibold text-heading">
              Instructions
            </h2>
            <ol className="mt-6 space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-button text-sm font-semibold text-primary">
                    {i + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-muted-foreground">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <p className="font-heading text-lg font-medium text-heading">
            Made this recipe?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tag us on Instagram @rootora and share your creation with our
            community.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
