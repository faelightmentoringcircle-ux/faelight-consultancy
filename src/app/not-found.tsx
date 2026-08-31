import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-enchanted p-6 text-center text-parchment">
      <div className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-firefly/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-twilight-light/30 blur-3xl" />
      <div className="relative z-10 max-w-md">
        <p className="animate-twinkle text-5xl text-firefly-bright">✦</p>
        <h1 className="mt-4 font-serif text-4xl">404</h1>
        <p className="mt-3 font-serif text-xl text-firefly-bright/90">
          This path wandered off into the fae-forest.
        </p>
        <p className="mt-2 text-sm text-parchment/70">
          The page you're looking for doesn't exist — but the next right step always does.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-gold">Back to home</Link>
          <Link href="/book" className="btn-ghost-light">Book a call</Link>
        </div>
      </div>
    </div>
  );
}
