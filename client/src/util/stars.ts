export function copyAuction(uuid: string) {
	navigator.clipboard.writeText(`/viewauction ${uuid}`)
	alert("Auction command copied to clipboard!\nPaste it in-game to view the auction.")
}

export function getMasterStarSymbol(num: number) {
	const symbols = ["➊", "➋", "➌", "➍", "➎"]
	return symbols[num - 1] || "★"
}

export function calculateStars(itemName: string): number {
	return (
		itemName.split("").filter((a) => a === "✪").length +
			(itemName.includes("➊") ? 1 : 0) +
			(itemName.includes("➋") ? 2 : 0) +
			(itemName.includes("➌") ? 3 : 0) +
			(itemName.includes("➍") ? 4 : 0) +
			(itemName.includes("➎") ? 5 : 0) || 0
	)
}
