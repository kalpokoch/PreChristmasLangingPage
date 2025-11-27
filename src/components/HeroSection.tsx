import { useEffect, useState } from 'react';
import stringLightsLeft from '../assets/light-incandescent-bulb-yellow-emitting-diode-symmetry-removebg-preview_edited.png';
import stringLightsRight from '../assets/light-incandescent-bulb-yellow-emitting-diode-symmetry-removebg-preview_edited.png';
import BookingModal from './BookingModal';

interface HeroSectionProps {
  bookingUrl?: string;
}

const HeroSection = ({ bookingUrl = "#" }: HeroSectionProps) => {
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
      <section className="relative bg-coral-primary flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 overflow-hidden">
        {/* String Lights */}
        <div className="absolute top-0 left-0 w-full pointer-events-none z-0">
          <div className="max-w-[1400px] mx-auto relative h-32 sm:h-40">
            <img 
              src={stringLightsLeft}
              alt="Decorative string lights"
              className="absolute left-[-20px] top-0 sm:left-[-70px] sm:top-20 h-full w-auto object-contain"
              style={{ maxWidth: '30%' }}
            />
            <img 
              src={stringLightsRight}
              alt="Decorative string lights"
              className="absolute right-[-20px] bottom-0 top-40 sm:right-[-70px] sm:top-20 sm:bottom-auto h-full w-auto object-contain scale-x-[-1]"
              style={{ maxWidth: '30%' }}
            />
          </div>
        </div>

        <div className="max-w-[1400px] w-full text-center relative z-10">
          <div className="relative overflow-hidden mb-8">
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[120px] font-black leading-[0.9] tracking-wider text-black">
              PRE-CHRISTMAS
              <br />
              MUSICAL NIGHT
            </h1>
            <div 
              className={`absolute inset-0 bg-coral-primary transition-transform duration-1000 ease-out ${
                isVisible ? '-translate-y-full' : 'translate-y-0'
              }`}
            />
          </div>

          <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-black mb-12">
            Live the Drop. Feel the Magic.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-block px-12 py-4 bg-black text-white border border-black text-lg uppercase tracking-wider transition-colors hover:bg-gray-section hover:text-black"
          >
            Book Now
          </button>
        </div>
      </section>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default HeroSection;
