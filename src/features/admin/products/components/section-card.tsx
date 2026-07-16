"use client";

import type { ReactNode } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type SectionCardProps = {
  value: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SectionCard({
  value,
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <AccordionItem
      value={value}
      className="rounded-xl border border-border bg-card px-4 shadow-soft md:px-6"
    >
      <AccordionTrigger className="hover:no-underline">
        <span className="text-left">
          <span className="block font-heading text-lg font-semibold text-heading">
            {title}
          </span>
          <span className="mt-1 block font-body text-sm font-normal text-muted-foreground">
            {description}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}
