import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import QuickCards from "@/components/QuickCards";
import InfoPanels from "@/components/InfoPanels";
import Services from "@/components/Services";
import Programmes from "@/components/Programmes";
import Courses from "@/components/Courses";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import Stats from "@/components/Stats";
import Recognitions from "@/components/Recognitions";
import Footer from "@/components/Footer";

export const revalidate = 60; // refresh notices from the dashboard every minute

export default function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <Navbar />
      <main id="main-content">
        <Hero />
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
          <div className="flex min-h-screen flex-col justify-center py-10">
            <QuickCards />
            <InfoPanels />
          </div>
          <Services />
          <Programmes />
        </div>

        <Courses />

        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
          <About />
          <Stats />
          <Recognitions />
        </div>

        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
