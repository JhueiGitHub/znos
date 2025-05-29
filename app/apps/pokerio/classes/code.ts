import * as CryptoJS from "crypto-js";

// Define the CODE_PREFIX constant directly since Config is not available
const CODE_PREFIX = "poker-game-prefix-";

/**
 * Translates a game code into a hashed socket URI
 * @param ip The game code/IP to translate
 * @returns The hashed socket URI for the game
 */
export function TranslateCode(ip: string): string {
	const hashed = CryptoJS.SHA256(CODE_PREFIX + ip).toString(
		CryptoJS.enc.Hex
	);

	return hashed;
}

/**
 * Generates a random 6-character game code
 * @returns A random game code string
 */
function generateRandomString(length: number): string {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}
	return result;
}

/**
 * Generates a random 6-character game code
 * @returns A random 6-character string
 */
export function code(): string {
	return generateRandomString(6);
}
