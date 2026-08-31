import type { Metadata } from "next";
import { SubBrandPage } from "@/components/SubBrandPage";
import { EXPERIENCES_CREATE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Experiences — Virtual Team Building & Workshops",
  description:
    "Faelight Experiences designs virtual team-building, story-led community workshops and custom themed online events with facilitation, visuals and flow.",
};

export default function ExperiencesPage() {
  return (
    <SubBrandPage
      slug="experiences"
      lead="Virtual team-building, story-led workshops and community events for remote teams and communities who want real connection — designed with facilitation, visuals and flow, and just enough magic."
      lists={[{ title: "What we create", items: EXPERIENCES_CREATE }]}
      bestForLine="Best for remote teams and communities who want connection that actually lands — warm, story-led experiences people remember long after the call ends."
    />
  );
}
