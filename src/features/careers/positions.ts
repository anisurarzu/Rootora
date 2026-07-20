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

/** Always-open part-time student role for social + customer messaging. */
export const CAREER_POSITIONS: CareerPosition[] = [
  {
    slug: "social-media-associate",
    title: "Social Media Associate",
    department: "Marketing & Support",
    type: "Part-time · Student friendly",
    location: "Remote / Dhaka",
    stipend: "৳5,000 / month",
    schedule: "4 days a week · 3–4 hours / day",
    openings: 2,
    alwaysOpen: true,
    summary:
      "Maintain ROOTORA’s Facebook and Instagram pages, and reply to customer messages across social inboxes and chat — posts, page upkeep, and everyday community care.",
    responsibilities: [
      "Maintain Facebook and Instagram pages day to day",
      "Prepare and schedule simple product & campaign posts",
      "Reply to comments, social inbox, and customer chat messages politely",
      "Help with basic order status and product questions",
      "Escalate complex issues to the core team quickly",
      "Keep replies and branding warm, clear, and on-brand",
    ],
    requirements: [
      "Comfortable using Facebook & Instagram regularly",
      "Friendly Bangla communication; basic English is a plus",
      "Patient, polite, and detail-oriented",
      "Student or fresher welcome — sincerity matters more than experience",
      "Can commit ~3–4 hours on 4 weekdays",
      "Reliable internet and a smartphone or laptop",
    ],
  },
];

export function getCareerPosition(slug: string) {
  if (slug === "customer-message-associate") {
    return CAREER_POSITIONS[0] ?? null;
  }
  return CAREER_POSITIONS.find((role) => role.slug === slug) ?? null;
}

export const TOTAL_OPENINGS = CAREER_POSITIONS.reduce(
  (sum, role) => sum + role.openings,
  0
);
