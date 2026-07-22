import { SupportConversationStatus, SupportMessageSender } from "@prisma/client";
import { z } from "zod";
import { activeOrderWhere } from "@/features/orders/order-status-code";
import { expandSearchQuery } from "@/features/search/expand-query";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const visitorIdSchema = z.string().min(8).max(64);
export const emailSchema = z.string().trim().email("Enter a valid email");

/** Customer chat history expires after this much inactivity. */
export const CHAT_HISTORY_TTL_MS = 10 * 60 * 1000; // 10 minutes

const ORDER_NUMBER_RE = /\b(RT-\d{4}-\d{1,3}-\d{3,})\b/i;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Order placed — waiting for confirmation",
  CONFIRMED: "Confirmed — queued for packing",
  PROCESSING: "Preparing / packing your items",
  SHIPPED: "On the way to you",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

type ProductFocus = "general" | "price" | "quality" | "stock";

type BotProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  salePrice: number | null;
  originalPrice: number | null;
  organic: boolean;
  origin: string | null;
  originBadge: string | null;
  certificateNumber: string | null;
  inStock: boolean;
  stockCount: number;
  unit: string | null;
  ingredients: string[];
  farmStory: string | null;
  productStory: string | null;
  categoryName: string | null;
  tags: string[];
};

const PRODUCT_INTENT_RE =
  /\b(honey|মধু|modhu|mustard|সরিষা|oil|তেল|punjabi|panjabi|পাঞ্জাবি|saree|শাড়ি|tshirt|t-shirt|tee|raglan|sweet|sweets|mishti|মিষ্টি|cham|chamcham|চমচম|jam|কালো|kalo|rosogolla|রসগোল্লা|product|products|collection|shop|buy|order this|দাম|মূল্য|price|cost|koto|কত|quality|organic|খাঁটি|pure|stock|available|available|link|url)\b/i;

const PRICE_FOCUS_RE =
  /\b(price|cost|how much|koto|কত|দাম|মূল্য|tk|taka|৳|sale|discount|offer)\b/i;

const QUALITY_FOCUS_RE =
  /\b(quality|organic|pure|খাঁটি|certificate|certified|origin|farm|farmer|natural|fresh|authentic|ingredient|ingredients)\b/i;

const STOCK_FOCUS_RE =
  /\b(stock|available|availability|in stock|out of stock|আছে|পাওয়া|পাবো)\b/i;

const AUTO_REPLY_RULES: Array<{
  match: RegExp;
  reply: string;
}> = [
  {
    match: /\b(hi|hello|hey|salam|assalam|হ্যালো|হাই)\b/i,
    reply:
      "Hi! I'm ROOTORA's assistant. Ask me about any product (honey, sweets, panjabi…), price, quality, shipping, COD, returns, careers — or paste an RT- order number to track live.\n\nExamples:\n• “honey price”\n• “kalo jam quality”\n• “mustard oil link”",
  },
  {
    match: /\b(career|careers|job|hiring|vacancy|apply|চাকরি)\b/i,
    reply:
      "Open roles are listed on /careers. You can apply online from that page. If nothing is listed, we’re not hiring right now — check back soon.",
  },
  {
    match: /\b(return|refund|exchange|ফেরত)\b/i,
    reply:
      "Returns are available for eligible items within our returns window. Full policy: /returns.\n\nFor a specific order, send your order number here or share your email to talk with a human agent.",
  },
  {
    match: /\b(ship|shipping|delivery|courier|ডেলিভারি|শিপিং)\b/i,
    reply:
      "We deliver across Bangladesh. Shipping is calculated at checkout; orders above the free-shipping threshold ship free.\n\nTypical metro delivery is faster than remote districts. Want help with a live order? Send your order number (RT-…).",
  },
  {
    match: /\b(payment|cod|cash on delivery|bkash|nagad|pay|পেমেন্ট)\b/i,
    reply:
      "Checkout currently supports Cash on Delivery (COD). Place your order on /shop → Checkout.\n\nIf something went wrong with payment or COD confirmation, share your email so a human agent can help.",
  },
  {
    match: /\b(contact|phone|email|address|location|যোগাযোগ)\b/i,
    reply:
      "You can reach us via this chat, or visit /contact.\nEmail: shoprootora@gmail.com\nFor order-specific help, send your RT- order number here or ask for a human agent.",
  },
  {
    match: /\b(sustainability|farmer|farm|কৃষক)\b/i,
    reply:
      "ROOTORA sources from local farmers and artisans across Bangladesh. Learn more on /sustainability and meet farmers at /farmers.\n\nAsk about a product (e.g. honey) if you want origin / organic details for that item.",
  },
  {
    match: /\b(invoice|receipt|bill)\b/i,
    reply:
      "After checkout you’ll get an order confirmation with your order number. You can also track status anytime at /track-order.\nSend your RT- number here and I’ll look it up for you.",
  },
  {
    match: /\b(human|agent|support|help me|talk to|representative|মানুষ|এজেন্ট)\b/i,
    reply:
      "Sure — I can connect you with our support team. Tap “Talk to a human” below (or share your email) and an agent will join this chat.",
  },
  {
    match: /\b(order|track|tracking|delivery status|অর্ডার|ট্র্যাক)\b/i,
    reply:
      "I can track your order right here. Please send your order number — it looks like RT-2026-20-0001 (from your confirmation / invoice).\n\nYou can also use /track-order anytime.",
  },
];

const DEFAULT_BOT_REPLY =
  "Thanks for messaging ROOTORA support! I can help with:\n• Products — name, price, quality, stock & links (try “honey” or “kalo jam price”)\n• Order tracking (send your RT- number)\n• Shipping & COD\n• Returns\n• Careers\n\nOr tap “Talk to a human” if you’d like our team.";

const WELCOME_MESSAGE =
  "Hi! Welcome to ROOTORA support.\n\nAsk me about products (honey, sweets, clothing…), prices, quality, shipping, COD, returns — or paste your order number (RT-…) to track live.\n\nExamples: “honey”, “mustard oil price”, “cham cham quality”.\n\nWant a human? Tap “Talk to a human” anytime.";
function normalizeOrderNumber(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

function detectProductFocus(message: string): ProductFocus {
  if (PRICE_FOCUS_RE.test(message)) return "price";
  if (QUALITY_FOCUS_RE.test(message)) return "quality";
  if (STOCK_FOCUS_RE.test(message)) return "stock";
  return "general";
}

function extractProductQuery(message: string): string {
  const cleaned = message
    .replace(PRICE_FOCUS_RE, " ")
    .replace(QUALITY_FOCUS_RE, " ")
    .replace(STOCK_FOCUS_RE, " ")
    .replace(
      /\b(please|pls|tell me|about|info|information|details|detail|show|list|want|need|looking for|ki|koto|ache|ase|bolo|bolun|জানতে|চাই|কী|কি|এর|একটু|দাও|দাও|link|url|page|buy|shop)\b/gi,
      " "
    )
    .replace(/[?!.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length >= 2) return cleaned;

  // Category shortcuts when the message is mostly intent words
  if (/\b(honey|মধু|modhu)\b/i.test(message)) return "honey";
  if (/\b(mustard|সরিষা|oil|তেল)\b/i.test(message)) return "mustard oil";
  if (/\b(punjabi|panjabi|পাঞ্জাবি)\b/i.test(message)) return "punjabi";
  if (/\b(sweet|sweets|mishti|মিষ্টি|cham|jam|কালো)\b/i.test(message)) {
    return "sweets";
  }
  return message.trim();
}

function formatBotPrice(product: BotProduct) {
  const current = product.salePrice ?? product.price;
  const unit = product.unit ? ` / ${product.unit}` : "";
  if (
    product.salePrice != null &&
    product.originalPrice != null &&
    product.originalPrice > product.salePrice
  ) {
    return `${formatPrice(product.salePrice)}${unit} (was ${formatPrice(product.originalPrice)})`;
  }
  if (product.salePrice != null && product.salePrice < product.price) {
    return `${formatPrice(product.salePrice)}${unit} (was ${formatPrice(product.price)})`;
  }
  return `${formatPrice(current)}${unit}`;
}

function qualityLines(product: BotProduct): string[] {
  const lines: string[] = [];
  if (product.organic) {
    lines.push("• Organic certified / organic flagged");
  }
  if (product.certificateNumber) {
    lines.push(`• Certificate: ${product.certificateNumber}`);
  }
  if (product.originBadge || product.origin) {
    lines.push(`• Origin: ${product.originBadge || product.origin}`);
  }
  if (product.ingredients.length > 0) {
    lines.push(`• Ingredients: ${product.ingredients.slice(0, 6).join(", ")}`);
  }
  const story =
    product.shortDescription ||
    product.productStory ||
    product.farmStory ||
    product.description?.split("\n").find((line) => line.trim().length > 20);
  if (story) {
    lines.push(`• ${story.trim().slice(0, 180)}${story.trim().length > 180 ? "…" : ""}`);
  }
  if (lines.length === 0) {
    lines.push("• Sourced and packed by ROOTORA for freshness and quality.");
  }
  return lines;
}

function formatProductCard(product: BotProduct, focus: ProductFocus): string {
  const href = `/shop/${product.slug}`;
  const stock = product.inStock
    ? `In stock${product.stockCount > 0 ? ` (${product.stockCount})` : ""}`
    : "Currently out of stock";

  if (focus === "price") {
    return [
      `• ${product.name}`,
      `  Price: ${formatBotPrice(product)}`,
      `  ${stock}`,
      `  Buy: ${href}`,
    ].join("\n");
  }

  if (focus === "quality") {
    return [
      `• ${product.name}`,
      ...qualityLines(product).map((line) => `  ${line}`),
      `  Price: ${formatBotPrice(product)}`,
      `  Details: ${href}`,
    ].join("\n");
  }

  if (focus === "stock") {
    return [
      `• ${product.name}`,
      `  ${stock}`,
      `  Price: ${formatBotPrice(product)}`,
      `  Buy: ${href}`,
    ].join("\n");
  }

  return [
    `• ${product.name}${product.categoryName ? ` (${product.categoryName})` : ""}`,
    `  Price: ${formatBotPrice(product)}`,
    `  ${stock}`,
    product.organic || product.originBadge
      ? `  Quality: ${[
          product.organic ? "Organic" : null,
          product.originBadge || product.origin,
        ]
          .filter(Boolean)
          .join(" · ")}`
      : null,
    product.shortDescription
      ? `  ${product.shortDescription.slice(0, 120)}${product.shortDescription.length > 120 ? "…" : ""}`
      : null,
    `  Link: ${href}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function lookupProductsForBot(
  rawQuery: string,
  limit = 4
): Promise<BotProduct[]> {
  const { terms } = expandSearchQuery(rawQuery);
  const searchTerms = terms.filter((term) => term.length >= 2).slice(0, 12);
  if (searchTerms.length === 0) return [];

  const rows = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      OR: searchTerms.flatMap((term) => [
        { name: { contains: term, mode: "insensitive" as const } },
        { shortDescription: { contains: term, mode: "insensitive" as const } },
        { description: { contains: term, mode: "insensitive" as const } },
        { tags: { has: term } },
        { brand: { contains: term, mode: "insensitive" as const } },
        { collection: { contains: term, mode: "insensitive" as const } },
        { sweetCategory: { contains: term, mode: "insensitive" as const } },
      ]),
    },
    take: 24,
    orderBy: [{ bestSeller: "desc" }, { featured: "desc" }, { updatedAt: "desc" }],
    include: {
      category: { select: { name: true } },
    },
  });

  const scored = rows
    .map((product) => {
      const name = product.name.toLowerCase();
      const slug = product.slug.toLowerCase();
      const tags = product.tags.map((tag) => tag.toLowerCase());
      const haystack = [
        name,
        slug,
        product.shortDescription,
        tags.join(" "),
        product.collection,
        product.sweetCategory,
        product.category?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const queryTokens = [
        ...new Set(
          searchTerms
            .flatMap((term) => term.toLowerCase().split(/\s+/))
            .filter((token) => token.length >= 2)
        ),
      ];

      let score = 0;
      let matchedTokens = 0;

      for (const term of searchTerms) {
        const t = term.toLowerCase();
        if (name === t) score += 20;
        if (name.includes(t)) score += 10;
        if (slug.includes(t)) score += 6;
        if (tags.some((tag) => tag === t || tag.includes(t))) score += 5;
        if (haystack.includes(t)) score += 2;
      }

      for (const token of queryTokens) {
        if (
          name.includes(token) ||
          slug.includes(token) ||
          tags.some((tag) => tag.includes(token))
        ) {
          matchedTokens += 1;
          score += 6;
        }
      }

      if (queryTokens.length > 1) {
        score += matchedTokens * 8;
        if (matchedTokens < Math.min(2, queryTokens.length)) {
          score -= 20;
        }
      }

      if (product.bestSeller) score += 1;
      if (product.featured) score += 1;
      return { product, score, matchedTokens, queryTokenCount: queryTokens.length };
    })
    .filter((row) => {
      if (row.score <= 0) return false;
      // Multi-word queries: drop weak partial matches (e.g. "kalo" alone on kalojira)
      if (row.queryTokenCount >= 2 && row.matchedTokens < 2) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ product }) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    price: Number(product.price),
    salePrice: product.salePrice != null ? Number(product.salePrice) : null,
    originalPrice:
      product.originalPrice != null ? Number(product.originalPrice) : null,
    organic: product.organic,
    origin: product.origin,
    originBadge: product.originBadge,
    certificateNumber: product.certificateNumber,
    inStock: product.inStock,
    stockCount: product.stockCount,
    unit: product.unit,
    ingredients: product.ingredients ?? [],
    farmStory: product.farmStory,
    productStory: product.productStory,
    categoryName: product.category?.name ?? null,
    tags: product.tags,
  }));
}

async function buildProductReply(
  message: string,
  focus: ProductFocus
): Promise<string | null> {
  const query = extractProductQuery(message);
  const products = await lookupProductsForBot(query, focus === "general" ? 4 : 3);

  if (products.length === 0) {
    return [
      `I couldn’t find a live product match for “${query}”.`,
      "Browse everything at /shop or /collections — or tell me a product name (e.g. honey, kalo jam, mustard oil, panjabi).",
      "Want a human? Tap “Talk to a human”.",
    ].join("\n");
  }

  const intro =
    focus === "price"
      ? `Here’s live pricing for “${query}”:`
      : focus === "quality"
        ? `Here’s quality / origin info for “${query}”:`
        : focus === "stock"
          ? `Here’s stock status for “${query}”:`
          : `Here’s what I found for “${query}”:`;

  const outro =
    focus === "price"
      ? "\nAsk “quality” or a product name for more detail. Checkout: /shop"
      : focus === "quality"
        ? "\nAsk for “price” if you want rates, or open a link above for full details."
        : "\nAsk “price”, “quality”, or “stock” for a focused answer — or paste an RT- number to track an order.";

  return [
    intro,
    "",
    ...products.map((product) => formatProductCard(product, focus)),
    outro,
  ].join("\n");
}

export async function lookupOrderForBot(rawOrderNumber: string) {
  const orderNumber = normalizeOrderNumber(rawOrderNumber);
  const order = await prisma.order.findFirst({
    where: {
      ...activeOrderWhere,
      orderNumber: { equals: orderNumber, mode: "insensitive" },
    },
    include: {
      address: { select: { district: true } },
      items: { select: { quantity: true } },
    },
  });

  if (!order) {
    return `I couldn’t find order ${orderNumber}. Please double-check the number on your confirmation/invoice, or try /track-order.\n\nStill stuck? Tap “Talk to a human”.`;
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const statusText =
    STATUS_LABEL[order.status] ?? order.status.replaceAll("_", " ");
  const district = order.address.district;

  return [
    `Here’s the latest for ${order.orderNumber}:`,
    `• Status: ${statusText}`,
    `• Items: ${itemCount}`,
    `• Total: ৳${Number(order.total).toLocaleString("en-BD")}`,
    district ? `• Destination: ${district}` : null,
    `• Payment: ${order.paymentMethod}${order.paymentStatus ? ` (${order.paymentStatus})` : ""}`,
    "",
    "Full timeline: /track-order",
    "Need a human to review this order? Tap “Talk to a human”.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function getBotReply(visitorMessage: string): Promise<string> {
  const message = visitorMessage.trim();
  const orderMatch = message.match(ORDER_NUMBER_RE);
  if (orderMatch?.[1]) {
    return lookupOrderForBot(orderMatch[1]);
  }

  // Product catalog answers (live price / quality / stock / links)
  const wantsProduct =
    PRODUCT_INTENT_RE.test(message) ||
    PRICE_FOCUS_RE.test(message) ||
    QUALITY_FOCUS_RE.test(message);

  if (wantsProduct) {
    // Don't steal pure shipping/payment/career intents that also mention "order"
    const isPolicyOnly =
      /\b(career|careers|return|refund|shipping|courier|cod|bkash|nagad|invoice|receipt)\b/i.test(
        message
      ) &&
      !/\b(honey|মধু|mustard|oil|punjabi|sweet|jam|cham|product|price|quality|organic)\b/i.test(
        message
      );

    if (!isPolicyOnly) {
      const focus = detectProductFocus(message);
      const productReply = await buildProductReply(message, focus);
      if (productReply) return productReply;
    }
  }

  for (const rule of AUTO_REPLY_RULES) {
    if (rule.match.test(message)) {
      return rule.reply;
    }
  }

  // Last chance: treat free-text as a product search
  const fallbackProducts = await lookupProductsForBot(message, 3);
  if (fallbackProducts.length > 0) {
    return [
      `I matched this to products in our catalog:`,
      "",
      ...fallbackProducts.map((product) =>
        formatProductCard(product, "general")
      ),
      "\nAsk “price” or “quality” for a focused answer.",
    ].join("\n");
  }

  return DEFAULT_BOT_REPLY;
}

/** @deprecated use getBotReply — kept for simple sync callers */
export function getAutoReply(visitorMessage: string): string {
  for (const rule of AUTO_REPLY_RULES) {
    if (rule.match.test(visitorMessage)) {
      return rule.reply;
    }
  }
  return DEFAULT_BOT_REPLY;
}
function mapMessage(message: {
  id: string;
  sender: SupportMessageSender;
  body: string;
  createdAt: Date;
  agentUserId: string | null;
}) {
  return {
    id: message.id,
    sender: message.sender,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    agentUserId: message.agentUserId,
  };
}

function isChatExpired(lastMessageAt: Date) {
  return Date.now() - lastMessageAt.getTime() > CHAT_HISTORY_TTL_MS;
}

export async function getOrCreateConversation(visitorId: string) {
  let conversation = await prisma.supportConversation.findFirst({
    where: {
      visitorId,
      status: { not: SupportConversationStatus.CLOSED },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
    },
  });

  // Expire stale customer chats so history does not linger forever.
  if (conversation && isChatExpired(conversation.lastMessageAt)) {
    await prisma.supportConversation.update({
      where: { id: conversation.id },
      data: { status: SupportConversationStatus.CLOSED },
    });
    conversation = null;
  }

  if (!conversation) {
    conversation = await prisma.supportConversation.create({
      data: {
        visitorId,
        status: SupportConversationStatus.BOT,
        messages: {
          create: {
            sender: SupportMessageSender.BOT,
            body: WELCOME_MESSAGE,
          },
        },
      },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  return {
    id: conversation.id,
    visitorId: conversation.visitorId,
    guestEmail: conversation.guestEmail,
    guestName: conversation.guestName,
    status: conversation.status,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    createdAt: conversation.createdAt.toISOString(),
    messages: conversation.messages.map(mapMessage),
    needsEmailForAgent: !conversation.guestEmail,
  };
}

export async function sendVisitorMessage(input: {
  visitorId: string;
  body: string;
}) {
  const body = input.body.trim();
  if (body.length < 1) {
    throw new Error("Message cannot be empty");
  }
  if (body.length > 2000) {
    throw new Error("Message is too long");
  }

  const conversation = await getOrCreateConversation(input.visitorId);
  const dbConversation = await prisma.supportConversation.findUniqueOrThrow({
    where: { id: conversation.id },
  });

  const visitorMessage = await prisma.supportMessage.create({
    data: {
      conversationId: dbConversation.id,
      sender: SupportMessageSender.VISITOR,
      body,
    },
  });

  let botMessage = null;

  // Auto-reply only while conversation is still in bot mode
  if (dbConversation.status === SupportConversationStatus.BOT) {
    const reply = await getBotReply(body);
    botMessage = await prisma.supportMessage.create({
      data: {
        conversationId: dbConversation.id,
        sender: SupportMessageSender.BOT,
        body: reply,
      },
    });
  }

  await prisma.supportConversation.update({
    where: { id: dbConversation.id },
    data: { lastMessageAt: new Date() },
  });

  return {
    conversationId: dbConversation.id,
    visitorId: dbConversation.visitorId,
    status: dbConversation.status,
    needsEmailForAgent: !dbConversation.guestEmail,
    messages: [visitorMessage, botMessage].filter(Boolean).map((m) =>
      mapMessage(m!)
    ),
  };
}

export async function switchConversationToBot(visitorId: string) {
  const conversation = await prisma.supportConversation.findFirst({
    where: {
      visitorId,
      status: { not: SupportConversationStatus.CLOSED },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    throw new Error("No active chat to switch.");
  }

  if (conversation.status === SupportConversationStatus.BOT) {
    return {
      id: conversation.id,
      visitorId: conversation.visitorId,
      guestEmail: conversation.guestEmail,
      guestName: conversation.guestName,
      status: conversation.status,
      needsEmailForAgent: !conversation.guestEmail,
      messages: [] as ReturnType<typeof mapMessage>[],
    };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.supportConversation.update({
      where: { id: conversation.id },
      data: {
        status: SupportConversationStatus.BOT,
        assignedAgentId: null,
        lastMessageAt: new Date(),
      },
    });

    const botMsg = await tx.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: SupportMessageSender.BOT,
        body: "You’re back with ROOTORA’s auto assistant. Ask me anything — products, shipping, COD, returns — or paste an RT- order number to track. You can request a human again anytime.",
      },
    });

    return { next, botMsg };
  });

  return {
    id: updated.next.id,
    visitorId: updated.next.visitorId,
    guestEmail: updated.next.guestEmail,
    guestName: updated.next.guestName,
    status: updated.next.status,
    needsEmailForAgent: !updated.next.guestEmail,
    messages: [mapMessage(updated.botMsg)],
  };
}

export async function requestHumanAgent(visitorId: string) {
  const conversation = await prisma.supportConversation.findFirst({
    where: {
      visitorId,
      status: { not: SupportConversationStatus.CLOSED },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    throw new Error("Start a chat first.");
  }

  if (!conversation.guestEmail) {
    return {
      needsEmail: true as const,
      id: conversation.id,
      visitorId: conversation.visitorId,
      status: conversation.status,
      guestEmail: conversation.guestEmail,
      guestName: conversation.guestName,
      needsEmailForAgent: true,
      messages: [] as ReturnType<typeof mapMessage>[],
    };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.supportConversation.update({
      where: { id: conversation.id },
      data: {
        status: SupportConversationStatus.WAITING_AGENT,
        lastMessageAt: new Date(),
      },
    });

    const botMsg = await tx.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: SupportMessageSender.BOT,
        body: `Got it — connecting you with a human agent. We’ll use ${conversation.guestEmail}. An agent will join shortly.`,
      },
    });

    return { next, botMsg };
  });

  return {
    needsEmail: false as const,
    id: updated.next.id,
    visitorId: updated.next.visitorId,
    status: updated.next.status,
    guestEmail: updated.next.guestEmail,
    guestName: updated.next.guestName,
    needsEmailForAgent: false,
    messages: [mapMessage(updated.botMsg)],
  };
}

export async function claimConversationWithEmail(input: {
  visitorId: string;
  email: string;
  name?: string;
}) {
  const email = emailSchema.parse(input.email).toLowerCase();
  const name = input.name?.trim() || null;

  const conversation = await prisma.supportConversation.findFirst({
    where: {
      visitorId: input.visitorId,
      status: { not: SupportConversationStatus.CLOSED },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    throw new Error("Start a chat before sharing your email.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.supportConversation.update({
      where: { id: conversation.id },
      data: {
        guestEmail: email,
        guestName: name,
        status:
          conversation.status === SupportConversationStatus.BOT
            ? SupportConversationStatus.WAITING_AGENT
            : conversation.status,
        lastMessageAt: new Date(),
      },
    });

    await tx.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: SupportMessageSender.BOT,
        body: `Thanks${name ? `, ${name}` : ""}! We've noted your email (${email}). A support agent will join this chat shortly.`,
      },
    });

    return next;
  });

  return {
    id: updated.id,
    visitorId: updated.visitorId,
    guestEmail: updated.guestEmail,
    guestName: updated.guestName,
    status: updated.status,
    needsEmailForAgent: false,
  };
}

export async function listAdminConversations() {
  const conversations = await prisma.supportConversation.findMany({
    where: {
      guestEmail: { not: null },
      status: {
        in: [
          SupportConversationStatus.WAITING_AGENT,
          SupportConversationStatus.ACTIVE,
          SupportConversationStatus.CLOSED,
        ],
      },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      assignedAgent: { select: { id: true, name: true } },
      _count: { select: { messages: true } },
    },
  });

  return conversations.map((c) => ({
    id: c.id,
    guestEmail: c.guestEmail,
    guestName: c.guestName,
    status: c.status,
    lastMessageAt: c.lastMessageAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
    messageCount: c._count.messages,
    preview: c.messages[0]?.body ?? "",
    lastSender: c.messages[0]?.sender ?? null,
    assignedAgent: c.assignedAgent,
  }));
}

/** Conversations waiting on an agent reply (badge count). */
export function countSupportAttention(
  conversations: Array<{ status: string; lastSender: string | null }>,
) {
  return conversations.filter(
    (c) =>
      c.status === SupportConversationStatus.WAITING_AGENT ||
      (c.status === SupportConversationStatus.ACTIVE &&
        c.lastSender === "VISITOR"),
  ).length;
}

export async function getAdminConversation(id: string) {
  const conversation = await prisma.supportConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      assignedAgent: { select: { id: true, name: true, email: true } },
    },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    visitorId: conversation.visitorId,
    guestEmail: conversation.guestEmail,
    guestName: conversation.guestName,
    status: conversation.status,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    createdAt: conversation.createdAt.toISOString(),
    assignedAgent: conversation.assignedAgent,
    messages: conversation.messages.map(mapMessage),
  };
}

export async function sendAgentReply(input: {
  conversationId: string;
  agentUserId: string;
  body: string;
}) {
  const body = input.body.trim();
  if (body.length < 1) throw new Error("Message cannot be empty");
  if (body.length > 4000) throw new Error("Message is too long");

  const conversation = await prisma.supportConversation.findUnique({
    where: { id: input.conversationId },
  });

  if (!conversation) throw new Error("Conversation not found");
  if (!conversation.guestEmail) {
    throw new Error("Visitor has not shared an email yet.");
  }

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: SupportMessageSender.AGENT,
        body,
        agentUserId: input.agentUserId,
      },
    });

    await tx.supportConversation.update({
      where: { id: conversation.id },
      data: {
        status: SupportConversationStatus.ACTIVE,
        assignedAgentId: input.agentUserId,
        lastMessageAt: new Date(),
      },
    });

    return created;
  });

  return {
    ...mapMessage(message),
    conversationId: conversation.id,
    visitorId: conversation.visitorId,
    status: SupportConversationStatus.ACTIVE,
    needsEmailForAgent: false,
  };
}

export async function updateConversationStatus(
  conversationId: string,
  status: SupportConversationStatus
) {
  return prisma.supportConversation.update({
    where: { id: conversationId },
    data: { status },
  });
}

export async function deleteSupportConversation(conversationId: string) {
  const existing = await prisma.supportConversation.findUnique({
    where: { id: conversationId },
    select: { id: true, visitorId: true },
  });

  if (!existing) {
    throw new Error("Conversation not found");
  }

  await prisma.supportConversation.delete({
    where: { id: conversationId },
  });

  return existing;
}

export async function getVisitorConversationSince(
  visitorId: string,
  since?: string
) {
  const conversation = await prisma.supportConversation.findFirst({
    where: {
      visitorId,
      status: { not: SupportConversationStatus.CLOSED },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    return { conversation: null, messages: [] as ReturnType<typeof mapMessage>[] };
  }

  const sinceDate = since ? new Date(since) : null;
  const messages = await prisma.supportMessage.findMany({
    where: {
      conversationId: conversation.id,
      ...(sinceDate && !Number.isNaN(sinceDate.getTime())
        ? { createdAt: { gt: sinceDate } }
        : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    conversation: {
      id: conversation.id,
      status: conversation.status,
      guestEmail: conversation.guestEmail,
      guestName: conversation.guestName,
      needsEmailForAgent: !conversation.guestEmail,
      lastMessageAt: conversation.lastMessageAt.toISOString(),
    },
    messages: messages.map(mapMessage),
  };
}
