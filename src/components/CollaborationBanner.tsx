import orangkhiLogo from '../assets/Green_and_Pink_Illustration_Henna_Artist_Logo-removebg-preview.png';

const CollaborationBanner = () => {
  return (
    <div className="bg-coral-primary">
      <div className="max-w-[1400px] mx-auto pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:gap-2">
          <span className="text-black font-thin text-sm sm:text-base tracking-wider uppercase">
            CO POWERED BY
          </span>
          
          <div className="flex items-center gap-2">            
            {/* Orangkhi Logo */}
            <div className="w-32 h-auto sm:w-32 sm:h-auto flex items-center justify-center">
              <img 
                src={orangkhiLogo}
                alt="Orangkhi Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationBanner;
