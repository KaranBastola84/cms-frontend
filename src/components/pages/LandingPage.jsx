import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpenCheck,
  ChevronRight,
  Clock3,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";

const navLinks = [
  { to: "/products", label: "Products" },
  { to: "/checkout", label: "Add to cart" },
  { to: "/login", label: "Login" },
  { to: "/inquiry", label: "Inquiry" },
];

const publicInfoCards = [
  {
    icon: BookOpenCheck,
    title: "Structured Programs",
    description:
      "Public catalog access for all training products, with clear outcomes and transparent pricing.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Standards",
    description:
      "Curriculum and assessments are aligned to practical cafe operations and professional workflows.",
  },
  {
    icon: Clock3,
    title: "Flexible Schedule",
    description:
      "Weekday and weekend options are available for students and working professionals.",
  },
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_18%_15%,rgba(0,0,0,0.07),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(0,0,0,0.04),transparent_40%),linear-gradient(165deg,#ffffff_0%,#fafafa_52%,#f3f3f3_100%)] font-[Manrope,Segoe_UI,sans-serif] text-zinc-900">
      <div
        className="pointer-events-none absolute -left-24 -top-32 h-96 w-96 rounded-full bg-black/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-24 h-96 w-96 rounded-full bg-black/10 blur-3xl"
        aria-hidden="true"
      />

      <header
        className={`sticky top-0 z-60 border-b transition-all duration-300 ${
          scrolled
            ? "border-black/10 bg-white/85 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="relative z-10 mx-auto flex min-h-20 w-[min(1120px,92vw)] items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-3"
            onClick={closeMenu}
          >
            <span
              className="h-[1.15rem] w-[1.15rem] rounded-full border border-black/25 bg-linear-to-br from-white to-zinc-400"
              aria-hidden="true"
            />
            <span className="text-[0.94rem] font-semibold uppercase tracking-[0.08em]">
              Brewista Coffee School
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-black/20 bg-white px-4 py-2 text-[0.79rem] font-semibold uppercase tracking-[0.08em] text-zinc-800 md:hidden"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>

          <nav
            className={`absolute left-[4vw] right-[4vw] top-[calc(100%-0.25rem)] flex flex-col gap-1 rounded-2xl border border-black/10 bg-white/95 p-2 backdrop-blur-md transition-all duration-200 md:static md:left-auto md:right-auto md:top-auto md:flex md:w-auto md:flex-row md:items-center md:gap-1 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none ${
              menuOpen
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-3 opacity-0 md:pointer-events-auto md:translate-y-0 md:opacity-100"
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-zinc-700 transition-all duration-200 hover:border-black/15 hover:bg-black/5 hover:text-zinc-900 md:rounded-full md:px-3 md:py-2"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section className="pb-10 pt-8 md:pt-14">
          <div className="relative z-10 mx-auto grid w-[min(1120px,92vw)] gap-5 lg:grid-cols-[1.2fr_0.9fr]">
            <div
              className={`rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-700 md:p-9 ${
                isReady
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
              }`}
            >
              <p className="text-[0.73rem] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Public Information
              </p>
              <h1 className="mt-3 text-[clamp(2rem,4.8vw,3.65rem)] leading-[1.03] font-[Cormorant_Garamond,Georgia,serif] text-zinc-900">
                Professional coffee education with clear outcomes.
              </h1>
              <p className="mt-4 max-w-[40ch] text-[0.99rem] leading-7 text-zinc-700">
                Brewista offers hands-on training for learners and cafe teams.
                Browse programs, add products to cart, sign in securely, or send
                an inquiry in minutes.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 max-[620px]:flex-col">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-1 rounded-full border border-black/20 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/40 hover:bg-zinc-50"
                >
                  View products
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/inquiry"
                  className="inline-flex items-center justify-center rounded-full border border-black/20 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/40 hover:bg-zinc-50"
                >
                  Talk to admissions
                </Link>
              </div>

              
            </div>

            <aside
              className={`flex rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.11)] backdrop-blur-md transition-all duration-700 md:p-8 ${
                isReady
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "120ms" }}
            >
              <div className="flex w-full flex-col">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.13em] text-zinc-500">
                  Admission Snapshot
                </p>
                <h2 className="mt-3 text-[clamp(1.55rem,2.8vw,2.2rem)] leading-[1.1] font-[Cormorant_Garamond,Georgia,serif] text-zinc-900">
                  Built for disciplined learning and real service standards.
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
                  <article className="rounded-xl border border-white/15 bg-black/30 px-4 py-3">
                    <strong className="block text-xl leading-none text-white">
                      06
                    </strong>
                    <span className="mt-1 block text-xs tracking-[0.04em] text-zinc-300">
                      Core programs
                    </span>
                  </article>
                  <article className="rounded-xl border border-white/15 bg-black/30 px-4 py-3">
                    <strong className="block text-xl leading-none text-white">
                      12
                    </strong>
                    <span className="mt-1 block text-xs tracking-[0.04em] text-zinc-300">
                      Seats per batch
                    </span>
                  </article>
                  <article className="rounded-xl border border-white/15 bg-black/30 px-4 py-3">
                    <strong className="block text-xl leading-none text-white">
                      24h
                    </strong>
                    <span className="mt-1 block text-xs tracking-[0.04em] text-zinc-300">
                      Inquiry response
                    </span>
                  </article>
                  <article className="rounded-xl border border-white/15 bg-black/30 px-4 py-3">
                    <strong className="block text-xl leading-none text-white">
                      100%
                    </strong>
                    <span className="mt-1 block text-xs tracking-[0.04em] text-zinc-300">
                      Practical sessions
                    </span>
                  </article>
                </div>

                <Link
                  to="/login"
                  className="mt-6 inline-flex w-fit items-center gap-1 border-b border-black/30 pb-1 text-sm font-semibold text-zinc-900 transition-colors duration-200 hover:border-black"
                >
                  Continue to login
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="py-6 md:py-10">
          <div className="relative z-10 mx-auto w-[min(1120px,92vw)]">
            <div>
              <p className="text-[0.74rem] font-bold uppercase tracking-[0.14em] text-zinc-500">
                Why this public page is useful
              </p>
              <h2 className="mt-3 max-w-[22ch] text-[clamp(1.7rem,4vw,2.55rem)] leading-[1.08] font-[Cormorant_Garamond,Georgia,serif] text-zinc-900">
                Everything important is accessible from one place.
              </h2>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {publicInfoCards.map((item, index) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className={`rounded-2xl border border-black/10 bg-white/80 p-5 shadow-[0_14px_26px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-1 ${
                      isReady
                        ? "translate-y-0 opacity-100"
                        : "translate-y-6 opacity-0"
                    }`}
                    style={{ transitionDelay: `${220 + index * 90}ms` }}
                  >
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-zinc-900">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="mt-3 text-[1.03rem] font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
