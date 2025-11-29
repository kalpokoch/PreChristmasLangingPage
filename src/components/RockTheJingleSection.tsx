import ZupiterImg from '../assets/zupiter.png';
import FlowerImg from '../assets/flower.png';


interface RockTheJingleSectionProps {
  bookingUrl?: string;
}


const RockTheJingleSection = ({ bookingUrl = "#" }: RockTheJingleSectionProps) => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Top Section - Gray gradient background with photo */}
      <div className="relative bg-gradient-to-b from-gray-500 via-gray-400 to-gray-300">
        {/* Header Text */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start pt-8 sm:pt-12 px-6 sm:px-12 lg:px-16 z-10">
          <h3 className="text-white text-[10px] sm:text-xs md:text-sm font-bold tracking-wide uppercase leading-tight">
            WE AS NEXT GEN<br />BROTHERHOOD
          </h3>
          <h3 className="text-white text-[10px] sm:text-xs md:text-sm font-bold tracking-wide uppercase">
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
      <div className="relative bg-[#f5f1ed] sm:bg-[#ebe5df] pb-16 sm:pb-20 md:pb-24">
        {/* ZUPITER Text Overlay - Spanning both sections */}
        <div className="absolute -top-16 sm:-top-20 md:-top-24 left-0 right-0 flex justify-center items-center px-4 z-20">
          <h1 
            className="text-[#ff3300] text-[4.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-black tracking-widest leading-none"
            style={{ 
              fontFamily: 'Extenda, Impact, Arial Black, sans-serif',
              transform: 'scaleY(400%)',
            }}
          >
            ZUPITER
          </h1>
        </div>


        {/* Flower/Holly decoration - Positioned over the text */}
        <div className="relative flex justify-center pt-24 sm:pt-32 md:pt-40 lg:pt-48 z-30">
          <img 
            src={FlowerImg} 
            alt="Holly decoration" 
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
          />
        </div>
      </div>
    </section>
  );
};


export default RockTheJingleSection;
