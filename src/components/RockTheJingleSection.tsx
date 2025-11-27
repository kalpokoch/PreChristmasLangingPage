import Img1 from '../assets/rock-the-jingle/image1.png';
interface RockTheJingleSectionProps {
  bookingUrl?: string;
}

const RockTheJingleSection = ({ bookingUrl = "#" }: RockTheJingleSectionProps) => {
  return (
    <section className="bg-coral-secondary py-10 sm:py-18 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Heading and Image */}
          <div className="space-y-8">
            {/* Main Heading */}
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider text-black">
              ROCK THE
              <br />
              JINGLE
            </h2>

            {/* Image Placeholder */}
            <div className="w-full aspect-video image-placeholder" />
          </div>

          {/* Right Column - Christmas Ornaments and Details */}
          <div className="flex flex-col justify-between h-full space-y-12">
            {/* Christmas Ornaments Decoration */}
            <div className="flex justify-end gap-4">
              {/* Red Ornament */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-black bg-coral-dark relative">
                <div className="absolute inset-2 border-2 border-black/30 rounded-full" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-3 h-4 bg-yellow-500 border-2 border-black" />
              </div>
              
              {/* Green Ornament */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-black bg-emerald-500 relative">
                <div className="absolute inset-2 flex items-center justify-center">
                  <div className="text-yellow-400 text-3xl">✦</div>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-3 h-4 bg-yellow-500 border-2 border-black" />
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-6 text-right">
              <div className="space-y-2">
                <p className="text-4xl sm:text-5xl font-black text-black">20 DEC</p>
                <p className="text-xl sm:text-2xl font-black text-black leading-tight">
                  GOLDEN JUBILEE
                  <br />
                  ROAD, NEW FLYOVER
                </p>
              </div>

              {/* Holly Decoration */}
              <div className="flex justify-end mb-6">
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-coral-dark rounded-full border-2 border-black" />
                    <div className="w-8 h-8 bg-coral-dark rounded-full border-2 border-black" />
                  </div>
                </div>
              </div>

              {/* Book Now Button */}
              <a
                href={bookingUrl}
                className="inline-block px-10 py-4 bg-black text-white font-bold text-xl uppercase tracking-wider border border-black hover:bg-gray-section"
              >
                BOOK NOW
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RockTheJingleSection;
