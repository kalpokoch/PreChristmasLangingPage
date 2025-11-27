import { useState, useEffect } from 'react';
import LogoLoop from './ui/LogoLoop';

const InfiniteCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const carouselText = "IN COLLABORATION WITH HYPE";

  // Desktop version with LogoLoop
  const textItems = [
    {
      node: (
        <div className="flex items-center gap-8">
          <span className="text-black font-thin text-xl md:text-2xl lg:text-[20px] tracking-wider uppercase whitespace-nowrap">
            {carouselText}
          </span>
          <div className="w-2 h-2 rounded-full flex-shrink-0" />
        </div>
      )
    },
    {
      node: (
        <div className="flex items-center gap-8">
          <span className="text-black font-normal text-xl md:text-2xl lg:text-[20px] tracking-wider uppercase whitespace-nowrap">
            {carouselText}
          </span>
          <div className="w-2 h-2 rounded-full flex-shrink-0" />
        </div>
      )
    }
  ];

  if (isMobile) {
    // Mobile version with CSS animation
    return (
      <div className="bg-gray-carousel border-y-2 border-black overflow-hidden py-4">
        <div className="flex animate-scroll-mobile whitespace-nowrap">
          {/* Repeat content 4 times for seamless loop */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center gap-6 px-4 flex-shrink-0">
              <span className="text-black font-normal text-base tracking-wider uppercase">
                {carouselText}
              </span>
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop version with LogoLoop
  return (
    <div className="bg-gray-carousel border border-black py-2 w-full overflow-hidden">
      <LogoLoop
        logos={textItems}
        speed={120}
        direction="left"
        width="100%"
        logoHeight={32}
        gap={24}
        pauseOnHover={true}
        fadeOut={false}
        scaleOnHover={false}
        ariaLabel="Collaboration partners"
      />
    </div>
  );
};

export default InfiniteCarousel;
