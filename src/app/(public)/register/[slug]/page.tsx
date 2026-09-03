import { RegisterLanding } from "@/components/RegisterLanding";

// Clean per-program link — e.g. /register/notion, /register/foundations.
// The slug resolves to a session client-side (data lives in the browser store),
// and old /register?session=<id> links keep working via the base route.
export default function RegisterSlugPage({ params }: { params: { slug: string } }) {
  return <RegisterLanding wanted={decodeURIComponent(params.slug)} />;
}
