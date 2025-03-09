export function formatTimeLeft(endTimestamp: number) {
	const now = Date.now()
	const timeLeft = endTimestamp - now

	if (timeLeft <= 0) return "Ended"

	const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
	const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

	if (days > 0) return `${days}d ${hours}h left`
	if (hours > 0) return `${hours}h ${minutes}m left`
	return `${minutes}m left`
}

export function formatPrice(price: number) {
	return price.toLocaleString() + " coins"
}
