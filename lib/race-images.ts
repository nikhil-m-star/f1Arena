// Real track photography for each Grand Prix venue
// Uses high-quality Unsplash photos with known stable IDs
const TRACK_PHOTOS: Record<string, string> = {
  // Australia — Melbourne skyline & Albert Park
  "australia": "https://images.unsplash.com/photo-1624138784614-87fd1b6528f0?w=800&q=80&fit=crop",
  // Bahrain — Bahrain International Circuit night
  "bahrain": "https://images.unsplash.com/photo-1614165531144-15ddac44a7aa?w=800&q=80&fit=crop",
  // Saudi Arabia — Jeddah corniche 
  "saudi": "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=80&fit=crop",
  // Japan — Suzuka / Mount Fuji  
  "japan": "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&q=80&fit=crop",
  // China — Shanghai skyline
  "china": "https://images.unsplash.com/photo-1474181628368-cb300655cd62?w=800&q=80&fit=crop",
  // Miami — Miami skyline
  "miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80&fit=crop",
  // Emilia Romagna — Imola, Italian countryside
  "emilia": "https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=800&q=80&fit=crop",
  // Monaco — Monte Carlo harbor
  "monaco": "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&q=80&fit=crop",
  // Canada — Montreal skyline
  "canada": "https://images.unsplash.com/photo-1519178614-68673b201f36?w=800&q=80&fit=crop",
  // Spain — Barcelona 
  "spain": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80&fit=crop",
  // Austria — Red Bull Ring mountains
  "austria": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80&fit=crop",
  // Great Britain — Silverstone area
  "british": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80&fit=crop",
  // Hungary — Budapest
  "hungary": "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=800&q=80&fit=crop",
  // Belgium — Spa-Francorchamps forest
  "belgium": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80&fit=crop",
  // Netherlands — Zandvoort coast
  "dutch": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80&fit=crop",
  // Italy — Monza
  "monza": "https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=800&q=80&fit=crop",
  // Singapore — Marina Bay
  "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80&fit=crop",
  // Azerbaijan — Baku
  "azerbaijan": "https://images.unsplash.com/photo-1603027065677-02540e6e78f4?w=800&q=80&fit=crop",
  // United States — Austin Texas
  "united_states": "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&q=80&fit=crop",
  // Mexico — Mexico City
  "mexico": "https://images.unsplash.com/photo-1518659526054-190340b32735?w=800&q=80&fit=crop",
  // Brazil — Sao Paulo
  "brazil": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80&fit=crop",
  // Las Vegas — Strip at night
  "vegas": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&q=80&fit=crop",
  // Qatar — Lusail
  "qatar": "https://images.unsplash.com/photo-1559666126-84f389727b9a?w=800&q=80&fit=crop",
  // Abu Dhabi — Yas Marina 
  "abu_dhabi": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80&fit=crop",
};

// Default fallback — generic racing/motorsport
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&fit=crop";

export function getRaceImageUrl(raceName: string): string {
  const normalized = raceName.toLowerCase();

  for (const [key, url] of Object.entries(TRACK_PHOTOS)) {
    if (normalized.includes(key)) {
      return url;
    }
  }

  // Extended matching for names that don't directly match keys
  if (normalized.includes("jeddah")) return TRACK_PHOTOS["saudi"];
  if (normalized.includes("melbourne")) return TRACK_PHOTOS["australia"];
  if (normalized.includes("suzuka")) return TRACK_PHOTOS["japan"];
  if (normalized.includes("shanghai")) return TRACK_PHOTOS["china"];
  if (normalized.includes("imola")) return TRACK_PHOTOS["emilia"];
  if (normalized.includes("montreal")) return TRACK_PHOTOS["canada"];
  if (normalized.includes("barcelona")) return TRACK_PHOTOS["spain"];
  if (normalized.includes("spielberg")) return TRACK_PHOTOS["austria"];
  if (normalized.includes("silverstone") || normalized.includes("great britain")) return TRACK_PHOTOS["british"];
  if (normalized.includes("budapest")) return TRACK_PHOTOS["hungary"];
  if (normalized.includes("spa")) return TRACK_PHOTOS["belgium"];
  if (normalized.includes("zandvoort")) return TRACK_PHOTOS["dutch"];
  if (normalized.includes("italian") || normalized.includes("italy")) return TRACK_PHOTOS["monza"];
  if (normalized.includes("marina bay")) return TRACK_PHOTOS["singapore"];
  if (normalized.includes("baku")) return TRACK_PHOTOS["azerbaijan"];
  if (normalized.includes("americas") || normalized.includes("cota") || normalized.includes("austin")) return TRACK_PHOTOS["united_states"];
  if (normalized.includes("sao paulo") || normalized.includes("interlagos")) return TRACK_PHOTOS["brazil"];
  if (normalized.includes("lusail")) return TRACK_PHOTOS["qatar"];
  if (normalized.includes("yas marina")) return TRACK_PHOTOS["abu_dhabi"];

  return FALLBACK_IMAGE;
}
