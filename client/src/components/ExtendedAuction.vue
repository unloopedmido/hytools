<script setup lang="ts">
import type { Auction } from "@/types/auction"
import { parseMinecraftText } from "@/util/colors"
import { copyAuction } from "@/util/stars"

const props = defineProps<{
	auction: Auction
	expandedAuction: string | null
	auctioneer: { name: string; id: string } | null
	viewAuctioneer?: boolean
}>()
</script>

<template>
	<div
		v-if="props.expandedAuction === props.auction.uuid"
		class="p-4 border-t border-[#2a2a2a] bg-[#191919] font-[Minecraft]"
	>
		<div class="flex flex-col md:flex-row gap-6">
			<div class="flex-1">
				<p v-html="parseMinecraftText(auction.item_lore.replace(/\n/g, '<br/>'))" class="text-sm" />
			</div>
			<div class="flex flex-col items-center gap-4 min-w-[120px]">
				<div class="text-center">
					<img
						class="h-20 mx-auto"
						:src="`https://minotar.net/body/${props.auction.auctioneer}/80.png`"
						alt="Seller avatar"
					/>
					<p class="mt-2 text-xs text-zinc-400">Seller</p>
				</div>
				<div class="text-center">
					<div class="bg-[#222222] p-2 rounded-md border border-[#333333]">
						<img
							class="h-16 w-16 object-contain mx-auto"
							:src="`https://sky.coflnet.com/static/icon/${props.auction.item_tag}`"
							alt="Item icon"
						/>
					</div>
					<p class="mt-2 text-xs text-zinc-400">Item icon</p>
				</div>
				<button @click="copyAuction(auction.uuid)" class="bg-purple-700 py-2 px-4 rounded-lg">
					View Auction
				</button>
				<button
					v-if="props.viewAuctioneer"
					@click="$router.push(`/auctions/${props.auctioneer?.name}`)"
					class="bg-purple-700 py-2 px-4 rounded-lg"
				>
					View Auctioneer
				</button>
			</div>
		</div>
	</div>
</template>
