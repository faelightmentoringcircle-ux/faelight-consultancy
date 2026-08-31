import type { Metadata } from "next";
import { PricingContent } from "./PricingContent";

export const metadata: Metadata = {
  title: "Classes & Services — Pricing Menu",
  description:
    "Faelight classes and services, clearly separated with pricing. Scheduled classes and programs for people; consulting, systems and experiences for businesses.",
};

export default function PricingPage() {
  return <PricingContent />;
}
