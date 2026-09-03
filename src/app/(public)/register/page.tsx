import { RegisterLanding } from "@/components/RegisterLanding";

// Base /register — falls back to the ?session= param, then the next upcoming
// session. Per-program clean links live at /register/<slug>.
export default function RegisterPage() {
  return <RegisterLanding />;
}
