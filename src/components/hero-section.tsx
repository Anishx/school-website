import Image from "next/image";

export function HeroSection() {
  return (
    <section
      className="relative flex flex-col"
      style={{ height: "calc(100svh - var(--header-height, 110px))" }}
      aria-label="Hero"
    >
      {/* Background image */}
      <Image
        src="/hero-image.jpg"
        alt="Apollo Vidhyalayam campus"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

      {/* Content — fills remaining space, text above the sticky bar */}
      <div className="relative z-10 flex flex-1 items-end justify-end pb-24 md:pb-28">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="ml-auto max-w-3xl text-right">
            <p className="text-lg font-semibold italic text-yellow-500 md:text-2xl">
              Learning. Leading. Excelling.
            </p>
            <h1 className="font-display mt-2 text-4xl uppercase leading-[1.1] text-white md:text-6xl lg:text-7xl">
              Rooted in <span className="text-yellow-500">Aragonda</span>
            </h1>
            <h1 className="font-display text-4xl uppercase leading-[1.1] text-white md:text-6xl lg:text-7xl">
              Raised with <span className="text-yellow-500">Discipline</span>
            </h1>
            <h1 className="font-display text-4xl uppercase leading-[1.1] text-white md:text-6xl lg:text-7xl">
              Excelling with <span className="text-yellow-500">Strength</span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
