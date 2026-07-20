import { blogPosts } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { expandSearchQuery, suggestWhenEmpty } from "@/features/search/expand-query";
import { detectLocale, fuzzyScore, normalizeSearchText } from "@/features/search/normalize";
import { POPULAR_SEARCH_TERMS } from "@/features/search/synonyms";
import type {
  SearchHit,
  SearchProvider,
  SearchQueryInput,
  SearchResponse,
} from "@/features/search/types";

function scoreText(query: string, ...fields: Array<string | null | undefined>) {
  let best = 0;
  for (const field of fields) {
    if (!field) continue;
    best = Math.max(best, fuzzyScore(query, field));
    for (const token of normalizeSearchText(field).split(" ")) {
      best = Math.max(best, fuzzyScore(query, token));
    }
  }
  return best;
}

function productOrClauses(terms: string[]) {
  return terms.flatMap((term) => [
    { name: { contains: term, mode: "insensitive" as const } },
    { shortDescription: { contains: term, mode: "insensitive" as const } },
    { description: { contains: term, mode: "insensitive" as const } },
    { brand: { contains: term, mode: "insensitive" as const } },
    { tags: { has: term } },
  ]);
}

/**
 * Lexical search provider — synonyms, typo map, fuzzy ranking.
 * Swap for AISearchProvider later without UI changes.
 */
export class LexicalSearchProvider implements SearchProvider {
  readonly id = "lexical" as const;

  async search(input: SearchQueryInput): Promise<SearchResponse> {
    const started = Date.now();
    const limit = Math.min(12, Math.max(1, input.limit ?? 6));
    const includeTrending = input.includeTrending ?? true;
    const { normalized, terms } = expandSearchQuery(input.q);
    const locale = detectLocale(input.q || normalized);

    const [trendingProducts, categoryRows, productRows] = await Promise.all([
      includeTrending
        ? prisma.product.findMany({
            where: {
              status: "PUBLISHED",
              OR: [{ trending: true }, { bestSeller: true }, { featured: true }],
            },
            take: 6,
            orderBy: [{ trending: "desc" }, { bestSeller: "desc" }, { updatedAt: "desc" }],
            include: {
              category: { select: { id: true, name: true, slug: true } },
            },
          })
        : Promise.resolve([]),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { products: { where: { status: "PUBLISHED" } } },
          },
        },
      }),
      normalized
        ? prisma.product.findMany({
            where: {
              status: "PUBLISHED",
              OR: productOrClauses(terms),
            },
            take: 40,
            orderBy: { updatedAt: "desc" },
            include: {
              category: { select: { id: true, name: true, slug: true } },
            },
          })
        : Promise.resolve([]),
    ]);

    const trending: SearchHit[] = trendingProducts.map((product, index) => ({
      id: product.id,
      kind: "product",
      title: product.name,
      subtitle: product.category?.name,
      href: `/shop/${product.slug}`,
      image: product.thumbnail ?? product.images[0] ?? null,
      price: Number(product.salePrice ?? product.price),
      score: 1 - index * 0.01,
      matchReasons: ["trending"],
    }));

    if (!normalized) {
      return {
        query: input.q,
        normalizedQuery: "",
        expandedTerms: [],
        locale,
        products: [],
        categories: [],
        blogs: [],
        trending,
        suggestions: [],
        popular: POPULAR_SEARCH_TERMS,
        tookMs: Date.now() - started,
        provider: this.id,
      };
    }

    const products: SearchHit[] = productRows
      .map((product) => {
        const score = Math.max(
          ...terms.map((term) =>
            scoreText(
              term,
              product.name,
              product.shortDescription,
              product.brand,
              product.tags.join(" "),
              product.category?.name
            )
          )
        );
        return {
          id: product.id,
          kind: "product" as const,
          title: product.name,
          subtitle: product.category?.name ?? undefined,
          href: `/shop/${product.slug}`,
          image: product.thumbnail ?? product.images[0] ?? null,
          price: Number(product.salePrice ?? product.price),
          score,
          matchReasons: score >= 0.65 ? ["fuzzy/synonym"] : ["contains"],
        };
      })
      .filter((hit) => hit.score >= 0.45)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const categories: SearchHit[] = categoryRows
      .map((category) => {
        const score = Math.max(
          ...terms.map((term) =>
            scoreText(term, category.name, category.description, category.slug)
          )
        );
        return {
          id: category.id,
          kind: "category" as const,
          title: category.name,
          subtitle: `${category._count.products} products`,
          href: `/shop?category=${category.slug}`,
          image: category.image,
          score,
          matchReasons: ["category"],
        };
      })
      .filter((hit) => hit.score >= 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Prefer DB blogs when published; fall back to editorial mock content.
    let blogSource: Array<{
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      category: string;
      image?: string | null;
    }> = [];

    try {
      const dbBlogs = await prisma.blogPost.findMany({
        where: { published: true },
        take: 30,
        orderBy: { publishedAt: "desc" },
      });
      blogSource =
        dbBlogs.length > 0
          ? dbBlogs
          : blogPosts.map((post) => ({
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              category: post.category,
              image: post.image,
            }));
    } catch {
      blogSource = blogPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        category: post.category,
        image: post.image,
      }));
    }

    const blogs: SearchHit[] = blogSource
      .map((post) => {
        const score = Math.max(
          ...terms.map((term) =>
            scoreText(term, post.title, post.excerpt, post.category)
          )
        );
        return {
          id: post.id,
          kind: "blog" as const,
          title: post.title,
          subtitle: post.category,
          href: `/blog/${post.slug}`,
          image: post.image,
          score,
          matchReasons: ["blog"],
        };
      })
      .filter((hit) => hit.score >= 0.45)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const hasResults =
      products.length > 0 || categories.length > 0 || blogs.length > 0;

    return {
      query: input.q,
      normalizedQuery: normalized,
      expandedTerms: terms,
      locale,
      products,
      categories,
      blogs,
      trending: hasResults ? [] : trending.slice(0, 4),
      suggestions: hasResults ? [] : suggestWhenEmpty(normalized),
      popular: POPULAR_SEARCH_TERMS,
      tookMs: Date.now() - started,
      provider: this.id,
    };
  }
}

let activeProvider: SearchProvider = new LexicalSearchProvider();

/** Swap this for an AI provider later without touching the API route UI. */
export function setSearchProvider(provider: SearchProvider) {
  activeProvider = provider;
}

export function getSearchProvider() {
  return activeProvider;
}

export async function runSmartSearch(input: SearchQueryInput) {
  return getSearchProvider().search(input);
}
