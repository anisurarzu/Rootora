import { auth } from "@/lib/auth";
import { ApiHttpError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export async function getApiSession(request: Request) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function requireApiSession(request: Request) {
  const session = await getApiSession(request);

  if (!session?.user) {
    throw new ApiHttpError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      banned: true,
    },
  });

  if (!user || user.banned) {
    throw new ApiHttpError("Account is not allowed to access this API", 403, {
      code: "FORBIDDEN",
    });
  }

  return { session, user };
}

export async function parseJsonBody<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiHttpError("Invalid JSON body", 400, { code: "INVALID_JSON" });
  }
}
