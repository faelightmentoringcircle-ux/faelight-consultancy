import type { Metadata } from "next";
import { SubBrandPage } from "@/components/SubBrandPage";
import { SYSTEMS_FIXES, SYSTEMS_CORE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Systems — Operations, SOPs & Notion Workspaces",
  description:
    "Faelight Systems designs operations, SOPs, Notion workspaces and dashboards for founders who need operations to stop living in their head.",
};

export default function SystemsPage() {
  return (
    <SubBrandPage
      slug="systems"
      lead="Operations consulting, process design and Notion builds for businesses whose operations are held together by vibes, memory and seventeen tabs. We turn the chaos into calm, documented systems your team can actually run."
      lists={[
        { title: "What we fix", items: SYSTEMS_FIXES },
        { title: "Core services", items: SYSTEMS_CORE },
      ]}
      bestForLine="Best for founders and teams whose operations live in one person's head — ready to trade scattered tabs for systems that create freedom."
      demoHref="/systems/landing"
    />
  );
}
