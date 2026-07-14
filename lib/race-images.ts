export function getRaceImageUrl(raceName: string): string {
  const normalized = raceName.toLowerCase();
  
  let filename = "Bahrain.png"; // Fallback

  if (normalized.includes("bahrain")) {
    filename = "Bahrain.png";
  } else if (normalized.includes("saudi") || normalized.includes("jeddah")) {
    filename = "Saudi_Arabia.png";
  } else if (normalized.includes("australia") || normalized.includes("melbourne")) {
    filename = "Australia.png";
  } else if (normalized.includes("japan") || normalized.includes("suzuka")) {
    filename = "Japan.png";
  } else if (normalized.includes("china") || normalized.includes("shanghai")) {
    filename = "China.png";
  } else if (normalized.includes("miami")) {
    filename = "Miami.png";
  } else if (normalized.includes("emilia") || normalized.includes("imola")) {
    filename = "Emilia_Romagna.png";
  } else if (normalized.includes("monaco")) {
    filename = "Monaco.png";
  } else if (normalized.includes("canada") || normalized.includes("montreal")) {
    filename = "Canada.png";
  } else if (normalized.includes("spain") || normalized.includes("barcelona")) {
    filename = "Spain.png";
  } else if (normalized.includes("austria") || normalized.includes("spielberg")) {
    filename = "Austria.png";
  } else if (normalized.includes("british") || normalized.includes("great britain") || normalized.includes("silverstone")) {
    filename = "Great_Britain.png";
  } else if (normalized.includes("hungar") || normalized.includes("budapest")) {
    filename = "Hungary.png";
  } else if (normalized.includes("belgium") || normalized.includes("spa")) {
    filename = "Belgium.png";
  } else if (normalized.includes("dutch") || normalized.includes("zandvoort")) {
    filename = "Netherlands.png";
  } else if (normalized.includes("monza") || normalized.includes("italy") || normalized.includes("italian")) {
    filename = "Italy.png";
  } else if (normalized.includes("singapore") || normalized.includes("marina bay")) {
    filename = "Singapore.png";
  } else if (normalized.includes("azerbaijan") || normalized.includes("baku")) {
    filename = "Azerbaijan.png";
  } else if (normalized.includes("united states") || normalized.includes("americas") || normalized.includes("cota") || normalized.includes(" Austin ")) {
    filename = "USA.png";
  } else if (normalized.includes("mexic")) {
    filename = "Mexico.png";
  } else if (normalized.includes("brazil") || normalized.includes("sao paulo") || normalized.includes("interlagos")) {
    filename = "Brazil.png";
  } else if (normalized.includes("vegas")) {
    filename = "Las_Vegas.png";
  } else if (normalized.includes("qatar") || normalized.includes("lusail")) {
    filename = "Qatar.png";
  } else if (normalized.includes("abu dhabi") || normalized.includes("yas marina")) {
    filename = "Abu_Dhabi.png";
  }

  return `https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/circuit-maps/16x9/${filename}`;
}
