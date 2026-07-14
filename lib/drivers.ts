export interface Driver {
  id: string;
  name: string;
  code: string;
  team: string;
}

export const DRIVERS: Driver[] = [
  { id: "max_verstappen", name: "Max Verstappen", code: "VER", team: "Red Bull Racing" },
  { id: "perez", name: "Sergio Pérez", code: "PER", team: "Red Bull Racing" },
  { id: "hamilton", name: "Lewis Hamilton", code: "HAM", team: "Ferrari" },
  { id: "leclerc", name: "Charles Leclerc", code: "LEC", team: "Ferrari" },
  { id: "norris", name: "Lando Norris", code: "NOR", team: "McLaren" },
  { id: "piastri", name: "Oscar Piastri", code: "PIA", team: "McLaren" },
  { id: "russell", name: "George Russell", code: "RUS", team: "Mercedes" },
  { id: "antonelli", name: "Andrea Kimi Antonelli", code: "ANT", team: "Mercedes" },
  { id: "alonso", name: "Fernando Alonso", code: "ALO", team: "Aston Martin" },
  { id: "stroll", name: "Lance Stroll", code: "STR", team: "Aston Martin" },
  { id: "sainz", name: "Carlos Sainz", code: "SAI", team: "Williams" },
  { id: "albon", name: "Alexander Albon", code: "ALB", team: "Williams" },
  { id: "gasly", name: "Pierre Gasly", code: "GAS", team: "Alpine" },
  { id: "ocon", name: "Esteban Ocon", code: "OCO", team: "Haas" },
  { id: "bearman", name: "Oliver Bearman", code: "BEA", team: "Haas" },
  { id: "hulkenberg", name: "Nico Hülkenberg", code: "HUL", team: "Kick Sauber" },
  { id: "bortoleto", name: "Gabriel Bortoleto", code: "BOR", team: "Kick Sauber" },
  { id: "tsunoda", name: "Yuki Tsunoda", code: "TSU", team: "RB" },
  { id: "lawson", name: "Liam Lawson", code: "LAW", team: "RB" },
  { id: "colapinto", name: "Franco Colapinto", code: "COL", team: "Alpine" } // fallback/additional
];

export function getDriverName(id: string): string {
  const driver = DRIVERS.find(d => d.id === id);
  return driver ? driver.name : id;
}

export function getDriverCode(id: string): string {
  const driver = DRIVERS.find(d => d.id === id);
  return driver ? driver.code : id.toUpperCase().slice(0, 3);
}
