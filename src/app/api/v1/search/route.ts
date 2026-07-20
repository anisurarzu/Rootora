import { runSmartSearch } from "@/features/search/service";
import { apiOk, apiOptions, handleApiError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const limit = Number(searchParams.get("limit") || 6);
    const includeTrending = searchParams.get("trending") !== "0";

    const result = await runSmartSearch({
      q,
      limit,
      includeTrending,
    });

    return apiOk(result, {
      meta: {
        tookMs: result.tookMs,
        provider: result.provider,
        expandedTerms: result.expandedTerms,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
