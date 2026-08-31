import { BrochureContent } from "./BrochureContent";

// Pre-render the finite set of brochures for static export.
export function generateStaticParams() {
  return [{ slug: "mentoring" }, { slug: "systems" }, { slug: "experiences" }, { slug: "all" }];
}

export default function BrochurePage({ params }: { params: { slug: string } }) {
  return <BrochureContent slug={params.slug} />;
}
