export type CareerPosition = {
  slug: string;
  title: string;
  department: string;
  type: string;
  location: string;
  stipend: string;
  schedule: string;
  openings: number;
  alwaysOpen: boolean;
  summary: string;
  responsibilities: string[];
  requirements: string[];
};

/** Always-open part-time student roles for social & customer messaging. */
export const CAREER_POSITIONS: CareerPosition[] = [
  {
    slug: "social-media-associate",
    title: "Social Media Associate",
    department: "Marketing",
    type: "Part-time · Student friendly",
    location: "Remote / Dhaka",
    stipend: "৳5,000 / month",
    schedule: "4 days a week · 3–4 hours / day",
    openings: 1,
    alwaysOpen: true,
    summary:
      "Maintain ROOTORA’s Facebook and Instagram presence — posts, page upkeep, and everyday community engagement.",
    responsibilities: [
      "Maintain Facebook and Instagram pages day to day",
      "Prepare and schedule simple product & campaign posts",
      "Reply to comments and inbox messages politely",
      "Keep branding consistent with ROOTORA’s tone",
    ],
    requirements: [
      "Comfortable using Facebook & Instagram regularly",
      "Clear Bangla writing; basic English is a plus",
      "Student or fresher welcome — sincerity matters more than experience",
      "Reliable internet and a smartphone or laptop",
    ],
  },
  {
    slug: "customer-message-associate",
    title: "Customer Message Associate",
    department: "Support",
    type: "Part-time · Student friendly",
    location: "Remote / Dhaka",
    stipend: "৳5,000 / month",
    schedule: "4 days a week · 3–4 hours / day",
    openings: 1,
    alwaysOpen: true,
    summary:
      "Reply to customer messages across chat and social inboxes — order questions, product help, and polite follow-ups.",
    responsibilities: [
      "Reply to customer messages on chat and social inboxes",
      "Help with basic order status and product questions",
      "Escalate complex issues to the core team quickly",
      "Keep replies warm, clear, and on-brand",
    ],
    requirements: [
      "Friendly communication in Bangla (English helpful)",
      "Patient, polite, and detail-oriented",
      "Student or fresher welcome",
      "Can commit ~3–4 hours on 4 weekdays",
    ],
  },
];

export function getCareerPosition(slug: string) {
  return CAREER_POSITIONS.find((role) => role.slug === slug) ?? null;
}

export const TOTAL_OPENINGS = CAREER_POSITIONS.reduce(
  (sum, role) => sum + role.openings,
  0
);
