import Header from "@/components/Header";
import CollaborationBanner from "@/components/CollaborationBanner";
import HeroSection from "@/components/HeroSection";
import InfiniteCarousel from "@/components/InfiniteCarousel";
import RockTheJingleSection from "@/components/RockTheJingleSection";
import SnowBeatsSection from "@/components/SnowBeatsSection";
import ArtistSection from "@/components/ArtistSection";
import ContactSection from "@/components/ContactSection";
import { artistsData } from "@/data/artistsData";

const Index = () => {
  // Replace with actual booking URLs
  const bookingUrl = "https://example.com/book";

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Add top padding to account for fixed header */}
      <div className="pt-20">
        <div id='home'>
          <CollaborationBanner />
          <HeroSection bookingUrl={bookingUrl} />
          <InfiniteCarousel />
        </div>
        <RockTheJingleSection bookingUrl={bookingUrl} />
        {/* <SnowBeatsSection bookingUrl={bookingUrl} /> */}

        <div id='artists'>
          <ArtistSection artists={artistsData}/>
        </div>

        <div id='contact'>
        <ContactSection
          phoneNumber="6901649023"
          email="hypeorg2024@gmail.com"
          address="Habrubari, Kokrajhar, Assam 783370"
          instagramUrl="https://www.instagram.com/nextgen.brothers?igsh=Ymc2czRnNGQyZ3c4"
        />
        </div>
      </div>
    </div>
  );
};

export default Index;
