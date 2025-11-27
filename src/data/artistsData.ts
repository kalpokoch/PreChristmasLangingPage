// src/data/artistsData.ts
import sagar from '../assets/artists/sagar.jpg';
import hayensa from '../assets/artists/hayensa.jpg';
import sujuma from '../assets/artists/sujuma.jpg';
import kaveri from '../assets/artists/kaveri.png';
import sooraj from '../assets/artists/sooraj.png';
import debayan from '../assets/artists/debayan.webp';

export interface Artist {
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

export const artistsData: Artist[] = [
  {
    id: 1,
    name: "UDALA",
    performanceType: "PIANO PERFORMANCE",
    image: sooraj,
    socialLinks: {
      instagram: "https://www.instagram.com/under2.8?igsh=OHQ3enpiNXFsdzM3",
      // facebook: "https://facebook.com/udala",
      youtube: "https://youtube.com/@mhry-u2s?si=JvKIDfAKquC4tWMN",
      spotify: "https://open.spotify.com/artist/3mIfAxkxW9lvPc74gkVsPE?si=uFavHocIQlGQ3312AF5U9A"
    }
  },
  {
    id: 2,
    name: "SUJUMA",
    performanceType: "POP MUSIC PERFORMANCE",
    image: sujuma,
    socialLinks: {
      instagram: "https://www.instagram.com/musicalsuju?igsh=Mmo5M3A1ZHdjanc5",
      // facebook: "https://facebook.com/sujuma"
    }
  },
  {
    id: 3,
    name: "SAGAR THAPA",
    performanceType: "DANCE PERFORMANCE BY THE EAGLES",
    image: sagar,
    socialLinks: {
      instagram: "https://www.instagram.com/sagar_thapa_12?igsh=bG83ODI5MWlycHky&utm_source=qr",
      youtube: "https://youtube.com/@sagarthapa8062?si=Z2lmYORYizH1e2QE"
    }
  },
  {
    id: 4,
    name: "HAYENSA",
    performanceType: "SOULFUL PERFORMANCE",
    image: hayensa,
    socialLinks: {
      instagram: "https://www.instagram.com/hayensamusic?igsh=MTh6NWdvMDY0OHpmaA==",
      youtube: "https://youtube.com/@hayensamusic?si=5y6HeU1zuFe64jCY",
      spotify: "https://open.spotify.com/artist/1T9YYXd0EKevv9lA4z5bfh?si=CbP-FtdeSgmKxhMGCUYpxg"
    }
  },
  {
    id: 5,
    name: "KAVERI",
    performanceType: "POP MUSIC PERFORMANCE",
    image: kaveri,
    socialLinks: {
      instagram: "https://www.instagram.com/kaveribasum?igsh=MWc1YzVzNGtlenNzaA==",
      // youtube: "https://youtube.com/@sagarthapa"
    }
  },
  {
    id: 5,
    name: "DEBAYAN",
    performanceType: "POP MUSIC PERFORMANCE",
    image: debayan,
    socialLinks: {
      instagram: "https://www.instagram.com/kaveribasum?igsh=MWc1YzVzNGtlenNzaA==",
      // youtube: "https://youtube.com/@sagarthapa"
    }
  }
];
