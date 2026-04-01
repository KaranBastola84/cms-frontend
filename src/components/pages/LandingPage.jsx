import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Star,
  ArrowRight,
  BookOpen,
  PlayCircle,
  Award,
  Clock3,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const signatureCourses = [
  {
    title: "Barista Foundations",
    duration: "4 Weeks",
    level: "Beginner",
    description:
      "Build a rock-solid base in espresso, milk texturing, and service flow with hands-on practice every session.",
  },
  {
    title: "Latte Art Mastery",
    duration: "3 Weeks",
    level: "Intermediate",
    description:
      "From hearts to tulips and rosettas, master pouring mechanics with live coaching and precision drills.",
  },
  {
    title: "Brew Methods Lab",
    duration: "5 Weeks",
    level: "All Levels",
    description:
      "Dial in V60, AeroPress, Chemex, and batch brew recipes using extraction theory and taste mapping.",
  },
  {
    title: "Cafe Leadership Track",
    duration: "6 Weeks",
    level: "Advanced",
    description:
      "Learn workflow design, team management, inventory controls, and profit-friendly service operations.",
  },
];

const learningHighlights = [
  {
    icon: Users,
    title: "Small Cohorts",
    description:
      "Personal mentorship with focused feedback in every practical session.",
  },
  {
    icon: Award,
    title: "Industry-Certified",
    description:
      "Graduate with credentials recognized by specialty cafes and training partners.",
  },
  {
    icon: Clock3,
    title: "Flexible Timings",
    description:
      "Weekday and weekend batches tailored for students, staff, and working professionals.",
  },
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F6EFE4] font-sans overflow-x-hidden w-full text-[#2B1C14]">
      {/* Sticky Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#2C1C14]/88 backdrop-blur-md shadow-lg py-4 border-b border-[#E6C9A5]/25"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Brewista Coffee School Logo"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Nav Links - Center */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/products"
              className="text-[#FFF5E8]/90 hover:text-white font-semibold transition-colors duration-200 text-sm tracking-[0.08em] uppercase"
            >
              Products
            </Link>
            <Link
              to="/about"
              className="text-[#FFF5E8]/90 hover:text-white font-semibold transition-colors duration-200 text-sm tracking-[0.08em] uppercase"
            >
              About
            </Link>
            <Link
              to="/courses"
              className="text-[#FFF5E8]/90 hover:text-white font-semibold transition-colors duration-200 text-sm tracking-[0.08em] uppercase"
            >
              Courses
            </Link>
          </div>

          {/* CTA - Right */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-md flex items-center gap-2 hover:scale-105 ${
                scrolled
                  ? "bg-[#E8B57A] text-[#2C1C14] hover:bg-[#F2C892]"
                  : "bg-[#E8B57A]/95 text-[#2C1C14] hover:bg-[#F2C892]"
              }`}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 w-full">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt="Barista making coffee"
            className="w-full h-full object-cover brightness-[0.72] contrast-105 saturate-105"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#2C1C14]/58 via-[#2C1C14]/46 to-[#2C1C14]/72"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,245,232,0.22),rgba(44,28,20,0.45)_55%,rgba(44,28,20,0.72)_100%)]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto mt-20 px-6 py-10 md:px-10 md:py-12 rounded-[2rem] bg-[#2C1C14]/45 border border-[#FFE7CC]/35 backdrop-blur-md shadow-[0_24px_70px_rgba(28,18,12,0.48)]">
          <span className="inline-block py-1.5 px-4 rounded-full bg-[#F7DDB9]/20 border border-[#F7DDB9]/55 text-[#FFF8EF] text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase mb-6">
            WELCOME TO EXCELLENCE
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
            <span className="text-[#FFF7ED] [text-shadow:0_10px_22px_rgba(28,18,12,0.85)]">
              Master the Art of
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FFFDF9] via-[#FCECD3] to-[#E8B57A]">
              Coffee Crafting
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#FFF4E6] mb-10 max-w-3xl mx-auto leading-relaxed font-medium [text-shadow:0_4px_12px_rgba(28,18,12,0.68)]">
            Elevate your barista skills with industry-leading experts. From bean
            to cup, discover the secrets of perfect extraction and latte art in
            our state-of-the-art academy.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 bg-[#E8B57A] hover:bg-[#F2C892] text-[#2C1C14] rounded-full font-extrabold transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-2 hover:-translate-y-1 transform shadow-[0_10px_22px_rgba(31,18,10,0.35)]"
            >
              Explore Courses
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-8 py-4 bg-[#FFFFFF]/8 border-2 border-[#FDE8CF]/60 hover:bg-[#FFFFFF]/16 text-[#FFF8F1] rounded-full font-extrabold transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1 transform"
            >
              <PlayCircle className="w-5 h-5 transition-colors" />
              Watch Story
            </Link>
          </div>
        </div>

        {/* Floating Stat Badges */}
        <div className="absolute bottom-8 left-0 right-0 z-20 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2C1C14]/42 backdrop-blur-lg border border-[#F5DEC3]/30 p-6 rounded-2xl flex items-center gap-4 transform hover:-translate-y-1.5 transition-transform duration-300 shadow-[0_10px_24px_rgba(28,18,12,0.4)]">
              <div className="bg-[#E8B57A]/20 p-3 rounded-xl border border-[#F6D8B2]/40">
                <Users className="w-8 h-8 text-[#FFF2E0]" />
              </div>
              <div className="text-left">
                <h3 className="text-3xl font-bold text-white mb-1">5,000+</h3>
                <p className="text-[#FFEED8] text-sm font-semibold uppercase tracking-[0.1em]">
                  Trained Baristas
                </p>
              </div>
            </div>

            <div className="bg-[#2C1C14]/42 backdrop-blur-lg border border-[#F5DEC3]/30 p-6 rounded-2xl flex items-center gap-4 transform hover:-translate-y-1.5 transition-transform duration-300 shadow-[0_10px_24px_rgba(28,18,12,0.4)]">
              <div className="bg-[#E8B57A]/20 p-3 rounded-xl border border-[#F6D8B2]/40">
                <BookOpen className="w-8 h-8 text-[#FFF2E0]" />
              </div>
              <div className="text-left">
                <h3 className="text-3xl font-bold text-white mb-1">20+</h3>
                <p className="text-[#FFEED8] text-sm font-semibold uppercase tracking-[0.1em]">
                  Expert Courses
                </p>
              </div>
            </div>

            <div className="bg-[#2C1C14]/42 backdrop-blur-lg border border-[#F5DEC3]/30 p-6 rounded-2xl flex items-center gap-4 transform hover:-translate-y-1.5 transition-transform duration-300 shadow-[0_10px_24px_rgba(28,18,12,0.4)]">
              <div className="bg-[#E8B57A]/20 p-3 rounded-xl border border-[#F6D8B2]/40">
                <Star className="w-8 h-8 text-[#FFF2E0]" />
              </div>
              <div className="text-left">
                <h3 className="text-3xl font-bold text-white mb-1">99%</h3>
                <p className="text-[#FFEED8] text-sm font-semibold uppercase tracking-[0.1em]">
                  Job Placement
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[#F6EFE4] to-transparent"></div>
      </section>

      {/* Signature Courses */}
      <section className="py-24 px-6 bg-[#F6EFE4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#8D5B33] text-sm font-semibold tracking-[0.16em] uppercase">
              Signature Programs
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl font-bold text-[#2C1C14]">
              Curated Learning Paths
            </h2>
            <div className="mt-5 flex items-center justify-center gap-3 text-[#B7824E]">
              <span className="h-px w-14 bg-linear-to-r from-transparent to-[#B7824E]/80"></span>
              <Sparkles className="w-4 h-4" />
              <span className="h-px w-14 bg-linear-to-r from-[#B7824E]/80 to-transparent"></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {signatureCourses.map((course, index) => (
              <article
                key={course.title}
                className="group relative overflow-hidden rounded-3xl border border-[#E7D7C3] bg-[#FFF9F0] p-7 shadow-[0_12px_32px_rgba(86,54,31,0.09)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_38px_rgba(86,54,31,0.17)]"
              >
                <span className="absolute -top-2 right-4 font-serif text-6xl leading-none text-[#D8B790]/35">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p className="text-xs uppercase tracking-[0.14em] text-[#A46E40] font-semibold">
                  {course.level}
                </p>
                <h3 className="mt-3 font-serif text-3xl text-[#2C1C14] leading-tight">
                  {course.title}
                </h3>
                <p className="mt-4 text-[#5A3A28] leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-[#8D5B33] font-semibold text-sm">
                  <Clock3 className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-24 px-6 bg-[#2C1C14] text-[#FFF5E8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#E8B57A] text-sm font-semibold tracking-[0.16em] uppercase">
              Why Brewista
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl font-bold text-white">
              Built for Real-World Coffee Careers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#F4D8B7]/25 bg-[#3A271D]/68 p-6 shadow-[0_12px_28px_rgba(22,12,8,0.35)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="inline-flex p-3 rounded-xl bg-[#E8B57A]/20 border border-[#F4D8B7]/35">
                    <Icon className="w-6 h-6 text-[#FFF2E0]" />
                  </div>
                  <h3 className="mt-4 text-2xl font-serif text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[#FBECDC]/90 leading-relaxed">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 text-[#FBECDC]">
            <div className="flex items-center gap-3 rounded-xl bg-[#3A271D]/58 border border-[#F4D8B7]/25 px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-[#E8B57A]" />
              <span>
                Live cafe simulation with real service-pressure scenarios
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#3A271D]/58 border border-[#F4D8B7]/25 px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-[#E8B57A]" />
              <span>Portfolio and interview prep for job-ready confidence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width CTA */}
      <section className="px-6 py-20 bg-[#F6EFE4]">
        <div className="max-w-7xl mx-auto rounded-[2rem] border border-[#E7C9A5]/45 bg-linear-to-r from-[#2C1C14] via-[#3A271D] to-[#2C1C14] px-8 py-12 md:px-12 md:py-14 shadow-[0_20px_44px_rgba(38,24,16,0.32)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl">
              <p className="text-[#F2C892] text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase">
                Enrollment Open Now
              </p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight">
                Turn Passion Into Profession.
              </h2>
              <p className="mt-4 text-[#FFEFD9]/90 text-base sm:text-lg leading-relaxed">
                Join the next batch and train with expert mentors in a studio
                built for craft, confidence, and career growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
              <Link
                to="/login"
                className="px-8 py-4 rounded-full bg-[#E8B57A] hover:bg-[#F2C892] text-[#2C1C14] font-bold text-center transition-colors duration-300"
              >
                Start Your Journey
              </Link>
              <Link
                to="/products"
                className="px-8 py-4 rounded-full border border-[#FFE7CC]/60 text-[#FFF8EF] hover:bg-white/10 font-bold text-center transition-colors duration-300"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
