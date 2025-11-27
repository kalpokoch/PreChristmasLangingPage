interface SnowBeatsSectionProps {
  bookingUrl?: string;
}

const SnowBeatsSection = ({ bookingUrl = "#" }: SnowBeatsSectionProps) => {
  return (
    <section className="bg-gray-section py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Candy Cane Decorations */}
      <div className="absolute top-8 left-8 w-16 h-32 sm:w-20 sm:h-40 opacity-80">
        <svg viewBox="0 0 40 80" className="w-full h-full">
          <path
            d="M20,10 Q15,10 15,15 L15,70 Q15,75 20,75 Q25,75 25,70 L25,15 Q25,10 20,10 Z M15,15 Q15,5 20,5 Q25,5 25,15"
            fill="#E85D4D"
            stroke="#000"
            strokeWidth="2"
          />
          <rect x="15" y="20" width="10" height="8" fill="white" />
          <rect x="15" y="36" width="10" height="8" fill="white" />
          <rect x="15" y="52" width="10" height="8" fill="white" />
        </svg>
      </div>

      <div className="absolute bottom-8 right-8 w-16 h-32 sm:w-20 sm:h-40 opacity-80 rotate-12">
        <svg viewBox="0 0 40 80" className="w-full h-full">
          <path
            d="M20,10 Q15,10 15,15 L15,70 Q15,75 20,75 Q25,75 25,70 L25,15 Q25,10 20,10 Z M15,15 Q15,5 20,5 Q25,5 25,15"
            fill="#E85D4D"
            stroke="#000"
            strokeWidth="2"
          />
          <rect x="15" y="20" width="10" height="8" fill="white" />
          <rect x="15" y="36" width="10" height="8" fill="white" />
          <rect x="15" y="52" width="10" height="8" fill="white" />
        </svg>
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Partnership Banner */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className="text-black font-bold text-sm tracking-wider uppercase">
            PARTNERED WITH
          </span>
          <div className="w-20 h-12 border-2 border-black bg-transparent flex items-center justify-center">
            <span className="text-black font-bold text-xs">Hype</span>
          </div>
          <span className="text-black font-bold text-lg">&</span>
          <div className="w-20 h-12 border-2 border-black bg-transparent flex items-center justify-center">
            <span className="text-black font-bold text-xs">Orangkhi</span>
          </div>
        </div>

        {/* Main Heading */}
        <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter text-black text-center mb-16">
          SNOW BEATS
          <br />
          WITH NANCY
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Event Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-3xl sm:text-4xl font-black text-black">20 DEC</p>
              <p className="text-xl sm:text-2xl font-black text-black leading-tight">
                GOLDEN JUBILEE ROAD, NEW
                <br />
                FLYOVER, NEAR GAYARY CAR WASH
              </p>
            </div>

            {/* Book Now Button */}
            <a
              href={bookingUrl}
              className="inline-block px-10 py-4 bg-black text-white font-bold text-xl uppercase tracking-wider hover-scale rounded-md"
            >
              BOOK NOW
            </a>
          </div>

          {/* Right Column - Image Placeholder */}
          <div className="w-full aspect-[4/3] image-placeholder" />
        </div>
      </div>
    </section>
  );
};

export default SnowBeatsSection;
