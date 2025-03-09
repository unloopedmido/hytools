<script setup lang="ts">
import ExtendedAuction from "@/components/ExtendedAuction.vue"
import { colors } from "@/constants/colors"
import type { Auction } from "@/types/auction"
import { fetchAuctions } from "@/util/api"
import { parseMinecraftText } from "@/util/colors"
import { formatPrice, formatTimeLeft } from "@/util/format"
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"

const loadingUser = ref(false)
const loadingAuctions = ref(false)
const user = ref<{ name: string; id: string } | null>(null)
const auctions = ref<Auction[]>([])
const expandedAuction = ref<string | null>(null)

const route = useRoute()
const username = route.params.username

async function fetchUser() {
	loadingUser.value = true
	// Get the user's UUID
	const mojangResponse = await fetch(`http://localhost:3000/users/username/${username}`)
	const mojangData = (await mojangResponse.json()) as { name: string; id: string }

	user.value = mojangData
	loadingUser.value = false

	// Get all auctions
	const allAuctions = await fetchAuctions(loadingAuctions)
	if (!allAuctions) return

	auctions.value = allAuctions?.auctions.filter((auction) => auction.auctioneer === mojangData.id)
}

function toggleAuctionDetails(uuid: string) {
	expandedAuction.value = expandedAuction.value === uuid ? null : uuid
}

onMounted(fetchUser)
</script>

<template>
	<!-- No User Found -->
	<div
		v-if="user && !user.name && !loadingUser"
		class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
	>
		<h1 class="text-3xl font-semibold text-zinc-300">User not found!</h1>
		<p class="text-lg text-zinc-400 mt-2">The user you are looking for does not exist.</p>
		<button @click="$router.push('/')" class="mt-4 bg-purple-700 py-2 px-4 rounded-lg">
			Go back
		</button>
	</div>

	<div v-else>
		<!-- Header -->
		<div v-if="!loadingUser" class="flex justify-center items-center mb-12">
			<h1 class="text-4xl font-bold tracking-tight text-purple-400 relative">
				{{ user?.name }}'s Auctions
				<span class="absolute -bottom-2 left-0 right-0 h-1 bg-purple-500 rounded-full"></span>
			</h1>
		</div>

		<!-- Loading state -->
		<div v-if="loadingAuctions" class="flex justify-center my-12">
			<div class="flex space-x-4 items-center">
				<div
					class="h-5 w-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"
				></div>
				<p class="font-medium text-zinc-300">Loading auctions...</p>
			</div>
		</div>

		<!-- Results header -->
		<div v-if="!loadingAuctions" class="flex justify-between items-center mb-6">
			<h2 class="text-xl font-semibold text-zinc-100">
				Results
				<span v-if="auctions.length > 0" class="text-sm font-normal text-zinc-400">
					({{ auctions.length }} auction{{ auctions.length !== 1 ? "s" : "" }})
				</span>
			</h2>
			<h2 className="text-xl font-semibold text-zinc-100">
				Total Value
				<span className="text-sm font-normal text-zinc-400">
					({{ formatPrice(auctions.reduce((acc, curr) => acc + curr.starting_bid, 0)) }})
				</span>
			</h2>
		</div>

		<!-- Auctions grid -->
		<div class="grid grid-cols-1 gap-5 mt-6">
			<div
				v-for="auction in auctions"
				:key="auction.uuid"
				class="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-lg overflow-hidden transition-all duration-200 hover:border-purple-500/50"
			>
				<!-- Compact view -->
				<div @click="toggleAuctionDetails(auction.uuid)" class="p-4 cursor-pointer">
					<div class="flex justify-between items-start">
						<div class="flex-1">
							<p
								v-html="
									parseMinecraftText(auction.item_name, colors[auction.tier as keyof typeof colors])
								"
								class="font-[Minecraft] text-sm mb-2"
							/>
							<div class="flex items-center space-x-3 mt-2">
								<span class="text-purple-400 text-base font-medium">{{
									formatPrice(auction.starting_bid)
								}}</span>
								<span
									v-if="auction.bin"
									class="bg-emerald-900/30 text-emerald-400 text-xs px-2 py-0.5 rounded-md"
									>BIN</span
								>
								<span v-else class="bg-amber-900/30 text-amber-400 text-xs px-2 py-0.5 rounded-md"
									>Auction</span
								>
							</div>
						</div>
						<div class="text-right">
							<span class="text-zinc-400 text-xs">{{ formatTimeLeft(auction.end) }}</span>
							<div class="mt-2 text-zinc-500 text-sm">
								<v-icon
									:name="expandedAuction === auction.uuid ? 'bi-chevron-up' : 'bi-chevron-down'"
									scale="1.2"
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- Expanded details -->
				<ExtendedAuction
					:auction="auction"
					:auctioneer="user"
					:expanded-auction="expandedAuction"
					:view-auctioneer="false"
				/>
			</div>
		</div>

		<!-- No results message -->
		<div
			v-if="user?.name && auctions.length === 0 && !loadingAuctions"
			class="text-center py-12 rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] shadow-md"
		>
			<p class="text-lg font-medium text-zinc-300">User has no auctions</p>
		</div>
	</div>
</template>
