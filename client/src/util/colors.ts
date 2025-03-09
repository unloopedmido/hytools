export function parseMinecraftText(text: string, baseColor?: string): string {
	// Map of Minecraft color codes to CSS colors
	const colorMap: Record<string, string> = {
		"0": "#000000", // Black
		"1": "#0000AA", // Dark Blue
		"2": "#00AA00", // Dark Green
		"3": "#00AAAA", // Dark Aqua
		"4": "#AA0000", // Dark Red
		"5": "#AA00AA", // Dark Purple
		"6": "#FFAA00", // Gold/Orange
		"7": "#AAAAAA", // Gray
		"8": "#555555", // Dark Gray
		"9": "#5555FF", // Blue
		a: "#55FF55", // Green
		b: "#55FFFF", // Aqua
		c: "#FF5555", // Red
		d: "#FF55FF", // Light Purple
		e: "#FFFF55", // Yellow
		f: "#FFFFFF", // White
	}

	// Format codes
	const formatMap: Record<string, string> = {
		k: "obfuscated", // Obfuscated (not easily implemented in HTML)
		l: "font-weight: bold;", // Bold
		m: "text-decoration: line-through;", // Strikethrough
		n: "text-decoration: underline;", // Underline
		o: "font-style: italic;", // Italic
		r: "reset", // Reset
	}

	let result = ""
	let currentSpan = false
	let currentStyle = baseColor ? `color: ${baseColor}` : "color: #FFFFFF;" // Default white color

	// Process each character
	for (let i = 0; i < text.length; i++) {
		// Check for dungeon stars
		if (text[i] === "✪") {
			result += `<span style="color: #FFD700;">✪</span>`
		} else if (text[i] === "➊") {
			result += `<span style="color: #FF5555;">➊</span>`
		} else if (text[i] === "➋") {
			result += `<span style="color: #FF5555;">➋</span>`
		} else if (text[i] === "➌") {
			result += `<span style="color: #FF5555;">➌</span>`
		} else if (text[i] === "➍") {
			result += `<span style="color: #FF5555;">➍</span>`
		} else if (text[i] === "➎") {
			result += `<span style="color: #FF5555;">➎</span>`
		} else if (text[i] === "§" && i + 1 < text.length) {
			const code = text[i + 1].toLowerCase()

			// Close current span if one is open
			if (currentSpan) {
				result += "</span>"
				currentSpan = false
			}

			// Handle color codes
			if (colorMap[code]) {
				currentStyle = `color: ${colorMap[code]};`
				result += `<span style="${currentStyle}">`
				currentSpan = true
			}
			// Handle format codes
			else if (formatMap[code]) {
				if (code === "r" && !baseColor) {
					// Reset to default
					currentStyle = "color: #FFFFFF;"
				} else {
					currentStyle += formatMap[code]
				}
				result += `<span style="${currentStyle}">`
				currentSpan = true
			}

			// Skip the code character
			i++
		} else {
			// Normal character, just append it
			if (!currentSpan) {
				result += `<span style="${currentStyle}">`
				currentSpan = true
			}
			result += text[i]
		}
	}

	// Close final span if needed
	if (currentSpan) {
		result += "</span>"
	}

	if (baseColor) {
		return `<span style="color: ${baseColor};">${result}</span>`
	}

	return result
}
