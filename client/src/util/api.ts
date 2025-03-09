import type { Auction } from "@/types/auction"
import type { Ref } from "vue"

export async function fetchAuctions(loading: Ref<boolean>) {
	loading.value = true
	try {
		const response = await fetch("http://localhost:3000/auctions")
		if (!response.ok) throw new Error("Failed to fetch auctions")
		return (await response.json()) as { totalAuctions: number; auctions: Auction[] }
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}
