// /root/app/apps/monopoly/utils/name-generator.ts
const botNames = [
  "HAL 9000",
  "R2-D2",
  "C-3PO",
  "WALL-E",
  "EVE",
  "Optimus",
  "Bender",
  "GLaDOS",
  "TARS",
  "CASE",
  "Baymax",
  "Johnny 5",
  "Robby",
  "Marvin",
  "Data",
];

let usedNames = new Set<string>();

export function generateBotName(): string {
  const availableNames = botNames.filter((name) => !usedNames.has(name));

  if (availableNames.length === 0) {
    usedNames.clear();
    return generateBotName();
  }

  const randomIndex = Math.floor(Math.random() * availableNames.length);
  const botName = availableNames[randomIndex];
  usedNames.add(botName);

  return botName;
}
