import { Instagram, Facebook, Youtube, Music } from 'lucide-react';

// Artist data type
interface Artist {
  id: number;
  name: string;
  performanceType: string;
  image: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    spotify?: string;
  };
}

interface ArtistSectionProps {
  artists: Artist[];
}

const ArtistSection = ({ artists }: ArtistSectionProps) => {
  return (
    <section className="bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          {/* Desktop Layout - Side by side */}
          <div className="hidden sm:flex items-center justify-between">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-400 tracking-wider uppercase">
              Featured Artists
            </h2>
            
            <p className="text-gray-400 text-sm md:text-base tracking-wider uppercase text-right">
              Meet Our Lineup
              <br />
              Exclusively From HYPE
            </p>
          </div>

          {/* Mobile Layout - Stacked */}
          <div className="sm:hidden space-y-4">
            <h2 className="text-4xl font-black text-gray-400 tracking-wider uppercase">
              Featured Artists
            </h2>
            
            <p className="text-gray-400 text-xs tracking-wider uppercase">
              Meet Our Lineup
              <br />
              Exclusive From HYPE
            </p>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24 lg:gap-56">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="group relative overflow-hidden"
            >
              {/* Artist Image */}
              <div className="relative overflow-hidden mb-4 aspect-[3/4]">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Social Links Overlay */}
                {artist.socialLinks && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                    {artist.socialLinks.instagram && (
                      <a
                        href={artist.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-6 h-6 text-black" />
                      </a>
                    )}
                    {artist.socialLinks.facebook && (
                      <a
                        href={artist.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="w-6 h-6 text-black" />
                      </a>
                    )}
                    {artist.socialLinks.youtube && (
                      <a
                        href={artist.socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="YouTube"
                      >
                        <Youtube className="w-6 h-6 text-black" />
                      </a>
                    )}
                    {artist.socialLinks.spotify && (
                      <a
                        href={artist.socialLinks.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Spotify"
                      >
                        <Music className="w-6 h-6 text-black" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className="space-y-2">
                <p className="text-gray-400 text-sm sm:text-base tracking-wider uppercase">
                  {artist.performanceType}
                </p>
                <h3 className="text-white text-2xl sm:text-3xl font-black tracking-wider uppercase">
                  {artist.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtistSection;
