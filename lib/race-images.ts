export function getRaceImageUrl(raceName: string, circuitName = ""): string {
  const params = new URLSearchParams({
    race: raceName,
    circuit: circuitName || "Formula 1 Circuit",
  });

  return `/api/race-image?${params.toString()}`;
}
