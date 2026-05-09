import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import ParityNote from "@/components/landing/ParityNote";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";
import { datasetStats } from "@/lib/data";

export default function Home() {
  const stats = datasetStats();
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero
          olympicCount={stats.olympicCount}
          paralympicCount={stats.paralympicCount}
          yearMin={stats.olympicYearSpan.min}
          yearMax={stats.olympicYearSpan.max}
        />
        <ParityNote />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
