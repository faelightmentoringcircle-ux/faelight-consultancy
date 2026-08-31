import type { Metadata } from "next";
import { ClassesContent } from "@/components/ClassesContent";

export const metadata: Metadata = {
  title: "Classes & Webinars — Upcoming & Past Sessions",
  description:
    "Upcoming Faelight classes and free webinars, with registration — plus replays of past sessions.",
};

export default function ClassesPage() {
  return <ClassesContent />;
}
