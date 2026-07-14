export function getRaceImageUrl(raceName: string): string {
  const normalized = raceName.toLowerCase();
  
  let filename = "Bahrain"; // Fallback

  if (normalized.includes("bahrain")) {
    filename = "Bahrain";
  } else if (normalized.includes("saudi") || normalized.includes("jeddah")) {
    filename = "Saudi_Arabia";
  } else if (normalized.includes("australia") || normalized.includes("melbourne")) {
    filename = "Australia";
  } else if (normalized.includes("japan") || normalized.includes("suzuka")) {
    filename = "Japan";
  } else if (normalized.includes("china") || normalized.includes("shanghai")) {
    filename = "China";
  } else if (normalized.includes("miami")) {
    filename = "Miami";
  } else if (normalized.includes("emilia") || normalized.includes("imola")) {
    filename = "Emilia_Romagna";
  } else if (normalized.includes("monaco")) {
    filename = "Monaco";
  } else if (normalized.includes("canada") || normalized.includes("montreal")) {
    filename = "Canada";
  } else if (normalized.includes("spain") || normalized.includes("barcelona")) {
    filename = "Spain";
  } else if (normalized.includes("austria") || normalized.includes("spielberg")) {
    filename = "Austria";
  } else if (normalized.includes("british") || normalized.includes("great britain") || normalized.includes("silverstone")) {
    filename = "Great_Britain";
  } else if (normalized.includes("hungar") || normalized.includes("budapest")) {
    filename = "Hungary";
  } else if (normalized.includes("belgium") || normalized.includes("spa")) {
    filename = "Belgium";
  } else if (normalized.includes("dutch") || normalized.includes("zandvoort")) {
    filename = "Netherlands";
  } else if (normalized.includes("monza") || normalized.includes("italy") || normalized.includes("italian")) {
    filename = "Italy";
  } else if (normalized.includes("singapore") || normalized.includes("marina bay")) {
    filename = "Singapore";
  } else if (normalized.includes("azerbaijan") || normalized.includes("baku")) {
    filename = "Baku";
  } else if (normalized.includes("united states") || normalized.includes("americas") || normalized.includes("cota") || normalized.includes(" Austin ")) {
    filename = "USA";
  } else if (normalized.includes("mexic")) {
    filename = "Mexico";
  } else if (normalized.includes("brazil") || normalized.includes("sao paulo") || normalized.includes("interlagos")) {
    filename = "Brazil";
  } else if (normalized.includes("vegas")) {
    filename = "Las_Vegas";
  } else if (normalized.includes("qatar") || normalized.includes("lusail")) {
    filename = "Qatar";
  } else if (normalized.includes("abu dhabi") || normalized.includes("yas marina")) {
    filename = "Abu_Dhabi";
  }

  return `https://media.formula1.com/image/upload/v1740000001/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${filename}_Circuit.webp`;
}
