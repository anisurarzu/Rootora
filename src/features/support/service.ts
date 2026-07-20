import { SupportConversationStatus, SupportMessageSender } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const visitorIdSchema = z.string().min(8).max(64);
export const emailSchema = z.string().trim().email("Enter a valid email");

const AUTO_REPLY_RULES: Array<{
  match: RegExp;
  reply: string;
}> = [
  {
    match: /\b(order|track|tracking|delivery status)\b/i,
    reply:
      "You can track your order anytime at /track-order using your order number. Need a human to check a specific order? Share your email so our team can help.",
  },
  {
    match: /\b(ship|shipping|delivery|courier)\b/i,
    reply:
      "We deliver across Bangladesh. Shipping is calculated at checkout, and orders above the free-shipping threshold ship free. Want details for your area? Leave your email and an agent will reply.",
  },
  {
    match: /\b(return|refund|exchange)\b/i,
    reply:
      "Returns are accepted for eligible items within our returns window. See /returns for the policy. For a specific case, share your email so support can assist.",
  },
  {
    match: /\b(payment|cod|bkash|nagad|pay)\b/i,
    reply:
      "We currently support Cash on Delivery at checkout. If payment failed or you need help with an order, share your email and our team will follow up.",
  },
  {
    match: /\b(human|agent|support|help me|talk to|representative)\b/i,
    reply:
      "Sure — I can connect you with our support team. Please share your email so we can continue this chat and get back to you.",
  },
  {
    match: /\b(honey|mustard|punjabi|saree|product)\b/i,
    reply:
      "Browse our shop for honey, mustard oil, panjabi, and more. If you need a product recommendation, tell me what you're looking for — or leave your email for personal help from our team.",
  },
];

const DEFAULT_BOT_REPLY =
  "Thanks for reaching out! I'm ROOTORA's assistant. Ask about orders, shipping, returns, or products. To speak with a human agent, share your email.";

const WELCOME_MESSAGE =
  "Hi! Welcome to ROOTORA support. Ask me anything about products, orders, or delivery. When you're ready for a human agent, just share your email.";

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
    const reply = getAutoReply(body);
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
    assignedAgent: c.assignedAgent,
  }));
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
