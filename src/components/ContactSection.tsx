import { Instagram } from 'lucide-react';
import logo from '../assets/logoNEXTGEN.png';
import Hypelogo from '../assets/Hype_page-0001.png';
import orangkhiLogo from '../assets/Green_and_Pink_Illustration_Henna_Artist_Logo-removebg-preview.png';

interface ContactSectionProps {
  phoneNumber?: string;
  email?: string;
  address?: string;
  instagramUrl?: string;
}

const ContactSection = ({
  phoneNumber = "6901649023",
  email = "hypeorg2024@gmail.com",
  address = "Habrubari, Kokrajhar, Assam 783370",
  instagramUrl = "https://www.instagram.com/nextgen.brothers?igsh=Ymc2czRnNGQyZ3c4"
}: ContactSectionProps) => {
  return (
    <>
      {/* Transition Divider - Black to Coral gradient with lines */}
      <div className="relative h-32  from-black via-black to-coral-primary overflow-hidden">
        {/* Horizontal lines effect */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-coral-primary opacity-30"
              style={{
                top: `${(i / 20) * 100}%`,
                height: '2px',
                transform: `scaleX(${1 - (i / 20)})`,
                transformOrigin: i % 2 === 0 ? 'left' : 'right'
              }}
            />
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <section className="bg-coral-primary py-10 border px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Logos - Vertical on mobile, Horizontal on desktop */}
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 mb-8">
            {/* NextGen Brothers Logo */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img 
                src={logo}
                alt="NextGen Brothers Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Hype Logo */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center overflow-hidden">
              <img 
                src={Hypelogo}
                alt="Hype Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Orangkhi Logo */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center overflow-hidden">
              <img 
                src={orangkhiLogo}
                alt="Orangkhi Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Contact Details - Bold Condensed Typography */}
          <div className="space-y-1 text-black mb-16 font-bebas">
            <a 
              href={`tel:${phoneNumber}`}
              className="block text-2xl sm:text-3xl font-normal hover:underline tracking-tight"
            >
              {phoneNumber}
            </a>
            <a 
              href={`mailto:${email}`}
              className="block text-xl sm:text-2xl font-normal hover:underline tracking-tight break-all"
            >
              {email}
            </a>
            <p className="text-lg sm:text-xl font-normal tracking-tight">
              {address}
            </p>
          </div>

          {/* Instagram Link */}
          <div className="mb-12">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-black hover:opacity-80 transition-opacity"
              aria-label="Instagram"
            >
              <Instagram className="w-8 h-8" strokeWidth={2} />
            </a>
          </div>

          {/* Connect with Us Section */}
          <div className="space-y-4">
            <h2 className="text-6xl sm:text-7xl md:text-8xl font-black text-black tracking-tight leading-none">
              Connect with Us
            </h2>
            <p className="text-xl sm:text-2xl font-bold text-black tracking-wide">
              Let's Get in Touch
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactSection;
