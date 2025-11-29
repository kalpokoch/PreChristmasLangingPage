import { useEffect, useState } from 'react';
import ZupiterImg from '../assets/zupiter.png';
import FlowerImg from '../assets/flower.png';
import NancyImg from '../assets/nancy.png';
import BookingModal from './BookingModal';


interface RockTheJingleSectionProps {
  bookingUrl?: string;
}

const RockTheJingleSection = ({ bookingUrl = "#" }: RockTheJingleSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
  
      return () => clearTimeout(timer);
    }, []);

  return (
    <>
      <section className="relative w-full overflow-hidden">
        {/* Top Section - Gray gradient background with photo */}
        <div className="relative bg-gradient-to-b from-gray-500 via-gray-400 to-gray-300">
          {/* Header Text */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-start pt-8 sm:pt-12 px-6 sm:px-12 lg:px-16 z-10">
            <h3 className="text-white text-[14px] sm:text-xs md:text-4xl font-bold tracking-wider uppercase leading-tight">
              WE AS NEXT GEN<br />BROTHERHOOD
            </h3>
            <h3 className="text-white text-[14px] sm:text-xs md:text-4xl font-bold tracking-wider uppercase">
              PROUDLY PRESENTS
            </h3>
          </div>



          {/* Artist Photo - 19:6 Aspect Ratio, Full Person Visible */}
          <div className="w-full aspect-[19/6] flex items-center justify-center">
            <img 
              src={ZupiterImg} 
              alt="Zupiter Artist" 
              className="w-[70%] object-contain object-center scale-[130%]"
            />
          </div>
        </div>



        {/* Bottom Section - Off-white/cream background */}
        <div className="relative bg-[#f5f1ed] sm:bg-[#ebe5df] pb-20 sm:pb-20 md:pb-48">
          {/* ZUPITER Text Overlay - Spanning both sections */}
          <div className="absolute -top-16 sm:-top-2 md:-top-2 left-0 right-0 flex justify-center items-center px-4 z-20">
            <h1 
              className="text-[#ff3300] text-[4.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] mt-12 font-black tracking-widest leading-none"
              style={{ 
                fontFamily: 'Extenda, Impact, Arial Black, sans-serif',
                transform: 'scaleY(300%)',
              }}
            >
              ZUPITER
            </h1>
          </div>



          {/* Flower/Holly decoration - Positioned over the text */}
          <div className="relative flex justify-center pt-14 sm:pt-32 md:pt-40 lg:pt-56 z-30">
            <img 
              src={FlowerImg} 
              alt="Holly decoration" 
              className="w-full h-16 sm:w-24 sm:h-auto md:w-20 md:h-20 lg:w-full lg:h-64 object-contain"
            />
          </div>


          {/* Event Details Section */}
          <div className="relative py-12 sm:py-16 md:py-20 px-6 sm:px-12 lg:px-16 font-['Poppins',sans-serif]">
            {/* Top: MUSICAL NIGHT with lines */}
            <div className="flex items-center justify-center gap-4 mb-12 sm:mb-16">
              <div className="flex-1 h-[3px] bg-[#ff3300] max-w-[100px] sm:max-w-[150px]"></div>
              <h2 className="text-[#ff3300] text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-[0.3em] uppercase whitespace-nowrap">
                MUSICAL NIGHT
              </h2>
              <div className="flex-1 h-[3px] bg-[#ff3300] max-w-[100px] sm:max-w-[150px]"></div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 sm:mb-16">
              {/* Left: Date */}
              <div className="text-center lg:text-left">
                <p className="text-[#ff3300] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold">
                  20.11.2025
                </p>
              </div>

              {/* Right: Location */}
              <div className="text-center lg:text-right">
                <p className="text-[#ff3300] text-xl sm:text-2xl md:text-3xl font-semibold leading-tight">
                  GOLDEN JUBILEE ROAD<br />
                  NEW FLYOVER, NEAR GAYARY
                </p>
              </div>
            </div>

            {/* Center: Book Now Button */}
            <div className="flex justify-center mb-12 sm:mb-16">
              <a
                onClick={() => setIsModalOpen(true)}
                className="bg-[#ff3300] text-white px-12 sm:px-16 md:px-20 py-4 sm:py-5 text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider hover:bg-[#cc2900] transition-colors"
              >
                BOOK NOW
              </a>
            </div>

            {/* Bottom Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 sm:mb-16">
              {/* Bottom Left: Ticket Details */}
              <div className="text-center lg:text-left">
                <p className="text-[#ff3300] text-lg sm:text-xl md:text-2xl font-bold uppercase">
                  TICKET DETAILS:
                </p>
                <p className="text-[#ff3300] text-lg sm:text-xl md:text-2xl font-normal">
                  INR 199 ONLY
                </p>
              </div>

              {/* Bottom Right: Time */}
              <div className="text-center lg:text-right">
                <p className="text-[#ff3300] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold">
                  06:00 PM
                </p>
              </div>
            </div>

            {/* Bottom: MUSICAL NIGHT with lines */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 h-[3px] bg-[#ff3300] max-w-[100px] sm:max-w-[150px]"></div>
              <h2 className="text-[#ff3300] text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-[0.3em] uppercase whitespace-nowrap">
                MUSICAL NIGHT
              </h2>
              <div className="flex-1 h-[3px] bg-[#ff3300] max-w-[100px] sm:max-w-[150px]"></div>
            </div>
          </div>
        </div>

        {/* DJ NANCY Section */}
        <div className="relative w-full">
          {/* DJ NANCY Text Overlay - Tall like ZUPITER */}
            <div className="absolute top-[1/4] left-0 right-0 flex justify-center items-center z-10">
              <h1 
                className="text-[#ff3300] text-[4rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] xl:text-[11rem] font-black tracking-widest"
                style={{ 
                  fontFamily: 'Extenda, Impact, Arial Black, sans-serif',
                  transform: 'scaleY(300%)',
                }}
              >
                DJ NANCY
              </h1>
            </div>
          {/* Nancy Image with DJ NANCY Text Overlay */}
          <div className="relative">
            <img 
              src={NancyImg} 
              alt="DJ Nancy" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};



export default RockTheJingleSection;
