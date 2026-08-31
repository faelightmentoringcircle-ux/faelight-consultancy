import type { Metadata } from "next";
import { SubBrandPage } from "@/components/SubBrandPage";
import { MENTORING_BUILDS, LEADERSHIP_THEMES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Mentoring Circle — VA Training & Career Readiness",
  description:
    "The Faelight Mentoring Circle trains virtual assistants and teams in small cohorts — role clarity, remote-work tools, communication and leadership. Because people are not sardines.",
};

export default function MentoringPage() {
  return (
    <SubBrandPage
      slug="mentoring"
      lead="VA training, career readiness and professional development — delivered in small cohorts of 4–10 so every learner is seen. We build capable people, not just certificates."
      lists={[
        { title: "What learners build (Foundations)", items: MENTORING_BUILDS },
        { title: "Leadership & EVA themes", items: LEADERSHIP_THEMES },
      ]}
      bestForLine="Best for beginners, career shifters and junior VAs ready to grow — and for teams who want a shared, work-ready skills baseline. Small cohorts, because people are not sardines."
    />
  );
}
