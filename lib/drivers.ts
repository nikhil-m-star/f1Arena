export interface Driver {
  id: string;
  name: string;
  code: string;
  team: string;
}

// Confirmed 2026 F1 Season Grid
export const DRIVERS: Driver[] = [
  // Red Bull Racing
  { id: "max_verstappen", name: "Max Verstappen", code: "VER", team: "Red Bull Racing" },
  { id: "hadjar", name: "Isack Hadjar", code: "HAD", team: "Red Bull Racing" },

  // Ferrari
  { id: "leclerc", name: "Charles Leclerc", code: "LEC", team: "Ferrari" },
  { id: "hamilton", name: "Lewis Hamilton", code: "HAM", team: "Ferrari" },

  // McLaren
  { id: "norris", name: "Lando Norris", code: "NOR", team: "McLaren" },
  { id: "piastri", name: "Oscar Piastri", code: "PIA", team: "McLaren" },

  // Mercedes
  { id: "russell", name: "George Russell", code: "RUS", team: "Mercedes" },
  { id: "antonelli", name: "Andrea Kimi Antonelli", code: "ANT", team: "Mercedes" },

  // Aston Martin
  { id: "alonso", name: "Fernando Alonso", code: "ALO", team: "Aston Martin" },
  { id: "stroll", name: "Lance Stroll", code: "STR", team: "Aston Martin" },

  // Alpine
  { id: "gasly", name: "Pierre Gasly", code: "GAS", team: "Alpine" },
  { id: "colapinto", name: "Franco Colapinto", code: "COL", team: "Alpine" },

  // Haas F1 Team
  { id: "ocon", name: "Esteban Ocon", code: "OCO", team: "Haas" },
  { id: "bearman", name: "Oliver Bearman", code: "BEA", team: "Haas" },

  // Racing Bulls
  { id: "lawson", name: "Liam Lawson", code: "LAW", team: "Racing Bulls" },
  { id: "lindblad", name: "Arvid Lindblad", code: "LIN", team: "Racing Bulls" },

  // Williams
  { id: "sainz", name: "Carlos Sainz", code: "SAI", team: "Williams" },
  { id: "albon", name: "Alexander Albon", code: "ALB", team: "Williams" },

  // Audi
  { id: "hulkenberg", name: "Nico Hulkenberg", code: "HUL", team: "Audi" },
  { id: "bortoleto", name: "Gabriel Bortoleto", code: "BOR", team: "Audi" },

  // Cadillac
  { id: "perez", name: "Sergio Perez", code: "PER", team: "Cadillac" },
  { id: "bottas", name: "Valtteri Bottas", code: "BOT", team: "Cadillac" },
];

export function getDriverName(id: string): string {
  const driver = DRIVERS.find(d => d.id === id);
  return driver ? driver.name : id;
}

export function getDriverCode(id: string): string {
  const driver = DRIVERS.find(d => d.id === id);
  return driver ? driver.code : id.toUpperCase().slice(0, 3);
}

export function getDriverTeam(id: string): string {
  const driver = DRIVERS.find(d => d.id === id);
  return driver ? driver.team : "Unknown";
}
