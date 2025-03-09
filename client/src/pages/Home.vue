<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { Auction } from "@/types/auction"
import { ref, computed } from "vue"
import { parseMinecraftText } from "@/util/colors"
import { colors } from "@/constants/colors"
import { calculateStars, getMasterStarSymbol } from "@/util/stars"
import { formatPrice, formatTimeLeft } from "@/util/format"
import { fetchAuctions } from "@/util/api"
import Items from "@/data/items.json"
import ExtendedAuction from "@/components/ExtendedAuction.vue"

// Core state
const loading = ref(false)
const loadingUser = ref(false)
const auctioneer = ref<{ name: string; id: string } | null>(null)
const search = ref("")
const filteredAuctions = ref<Auction[]>([])
const hasSearched = ref(false)
const expandedAuction = ref<string | null>(null)
const showFilters = ref(false)

// Autocomplete state
const showAutocomplete = ref(false)
const activeItemIndex = ref(0)

// Filter valid items from the itemsjson data
const validItems = computed(() => {
	return Items.filter(
		(item) => item.name && item.name !== "null" && item.tag && typeof item.flags !== "undefined",
	) as Array<{ name: string; tag: string; flags: string | number }>
})

// Filter items based on search input
const filteredItems = computed(() => {
	if (!search.value) return []

	const searchLower = search.value.toLowerCase()
	return validItems.value
		.filter((item) => item.name && item.name.toLowerCase().includes(searchLower))
		.slice(0, 8) // Limit to 8 suggestions
})

// Handle item selection from autocomplete
function selectItem(item: { name: string; tag: string; flags: number | string }) {
	search.value = item.name
	showAutocomplete.value = false
	filterAuctions()
}

// Navigate through autocomplete options with keyboard
function navigateAutocomplete(direction: "up" | "down") {
	if (!showAutocomplete.value || filteredItems.value.length === 0) return

	if (direction === "down") {
		activeItemIndex.value = (activeItemIndex.value + 1) % filteredItems.value.length
	} else {
		activeItemIndex.value =
			activeItemIndex.value <= 0 ? filteredItems.value.length - 1 : activeItemIndex.value - 1
	}
}

// Filter state
const sortOption = ref("price-desc")
const auctionType = ref("all")
const selectedRarity = ref("all")
const minDungeonStars = ref(0)

const sortOptions = [
	{ value: "price-asc", label: "Price: Low to High" },
	{ value: "price-desc", label: "Price: High to Low" },
	{ value: "time-asc", label: "Ending Soon" },
	{ value: "time-desc", label: "Ending Later" },
]

async function filterAuctions() {
	showAutocomplete.value = false
	if (search.value.length < 3) return
	const auctions = await fetchAuctions(loading)
	hasSearched.value = true
	if (!auctions) return
	filteredAuctions.value = auctions.auctions.filter((auction) =>
		auction.item_name.toLowerCase().includes(search.value.toLowerCase()),
	) as Auction[]
}

// UI interaction functions
async function toggleAuctionDetails(uuid: string) {
	loadingUser.value = true
	expandedAuction.value = expandedAuction.value === uuid ? null : uuid

	// Get the auctioneer's name
	const auctioneerUUID = filteredAuctions.value.find((auction) => auction.uuid === uuid)?.auctioneer
	if (!auctioneerUUID) return

	const mojangResponse = await fetch(`http://localhost:3000/users/uuid/${auctioneerUUID}`)
	const mojangData = (await mojangResponse.json()) as { name: string; id: string }

	auctioneer.value = mojangData
	loadingUser.value = false
}

function toggleFilters() {
	showFilters.value = !showFilters.value
}

function setMinDungeonStars(stars: number) {
	minDungeonStars.value = minDungeonStars.value === stars ? 0 : stars
}

function resetFilters() {
	sortOption.value = "price-desc"
	auctionType.value = "all"
	selectedRarity.value = "all"
	minDungeonStars.value = 0
}

// Computed filtered & sorted auctions
const displayedAuctions = computed(() => {
	let auctions = [...filteredAuctions.value]

	// Apply filters
	if (auctionType.value !== "all") {
		const isBin = auctionType.value === "bin"
		auctions = auctions.filter((auction) => auction.bin === isBin)
	}

	if (selectedRarity.value !== "all") {
		auctions = auctions.filter((auction) => auction.tier === selectedRarity.value)
	}

	if (minDungeonStars.value > 0) {
		auctions = auctions.filter(
			(auction) => calculateStars(auction.item_name) >= minDungeonStars.value,
		)
	}

	// Sort auctions
	return auctions.sort((a, b) => {
		switch (sortOption.value) {
			case "price-asc":
				return a.starting_bid - b.starting_bid
			case "price-desc":
				return b.starting_bid - a.starting_bid
			case "time-asc":
				return a.end - b.end
			case "time-desc":
				return b.end - a.end
			default:
				return 0
		}
	})
})
</script>

<template>
	<!-- Header -->
	<div class="flex justify-center items-center mb-12">
		<h1 class="text-4xl font-bold tracking-tight text-purple-400 relative">
			Auction Explorer
			<span class="absolute -bottom-2 left-0 right-0 h-1 bg-purple-500 rounded-full"></span>
		</h1>
	</div>

	<!-- Search form -->
	<div class="mb-6 bg-[#1e1e1e] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
		<label for="search" class="block text-lg font-medium mb-3 text-zinc-200">
			Search Auctions
		</label>
		<div class="flex flex-col sm:flex-row gap-4">
			<div class="flex-1 relative">
				<input
					id="search"
					v-model="search"
					type="text"
					class="w-full p-3 pl-10 rounded-lg bg-[#262626] border border-[#363636] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all text-zinc-100 placeholder-zinc-500"
					placeholder="Enter at least 3 characters..."
					@keyup.enter="filterAuctions()"
					@input="showAutocomplete = search.length >= 1"
					@keydown.down="navigateAutocomplete('down')"
					@keydown.up.prevent="navigateAutocomplete('up')"
					@keydown.esc="showAutocomplete = false"
				/>
				<div
					v-if="showAutocomplete && filteredItems.length > 0"
					class="absolute z-10 w-full mt-1 bg-[#262626] border border-[#363636] rounded-lg shadow-lg max-h-60 overflow-y-auto"
				>
					<div
						v-for="(item, index) in filteredItems"
						:key="item.tag"
						@click="selectItem(item)"
						@mouseover="activeItemIndex = index"
						class="flex items-center p-2 hover:bg-[#363636] cursor-pointer transition-colors"
						:class="{ 'bg-[#363636]': index === activeItemIndex }"
					>
						<img
							:src="`https://sky.coflnet.com/static/icon/${item.tag}`"
							:alt="item.name + ' icon'"
							class="w-6 h-6 mr-2"
							onerror="this.onerror=null;this.src='https://sky.coflnet.com/static/icon/FALLBACK_ITEM';"
						/>
						<span class="text-zinc-100">{{ item.name }}</span>
					</div>
				</div>
				<v-icon
					name="bi-search"
					class="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500"
				/>
			</div>
			<div class="flex gap-3">
				<button
					@click="toggleFilters"
					class="w-full px-4 py-3 rounded-lg bg-[#2d2d2d] hover:bg-[#363636] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
					:class="{ 'bg-purple-600 hover:bg-purple-700': showFilters }"
				>
					<div class="flex items-center justify-center">
						<v-icon name="bi-filter" class="mr-2" />
						Filters
					</div>
				</button>
				<button
					@click="filterAuctions()"
					class="w-full px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1e1e1e] disabled:opacity-50"
					:disabled="search.length < 3"
				>
					Search
				</button>
			</div>
		</div>
		<p class="mt-2 text-xs text-zinc-500">Minimum 3 characters required</p>
	</div>

	<!-- Filter panel -->
	<div
		v-if="showFilters"
		class="mb-6 bg-[#1e1e1e] rounded-xl p-6 shadow-lg border border-[#2a2a2a] animate-fadeIn"
	>
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			<!-- Sort options -->
			<div>
				<label class="block text-sm font-medium mb-2 text-zinc-300">Sort By</label>
				<select
					v-model="sortOption"
					class="w-full p-2 rounded-lg bg-[#262626] border border-[#363636] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none text-zinc-100"
				>
					<option v-for="option in sortOptions" :key="option.value" :value="option.value">
						{{ option.label }}
					</option>
				</select>
			</div>

			<!-- Auction type -->
			<div>
				<label class="block text-sm font-medium mb-2 text-zinc-300">Listing Type</label>
				<select
					v-model="auctionType"
					class="w-full p-2 rounded-lg bg-[#262626] border border-[#363636] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none text-zinc-100"
				>
					<option value="all">All Types</option>
					<option value="bin">BIN Only</option>
					<option value="auction">Auction Only</option>
				</select>
			</div>

			<!-- Rarity filter -->
			<div>
				<label class="block text-sm font-medium mb-2 text-zinc-300">Rarity</label>
				<select
					v-model="selectedRarity"
					class="w-full p-2 rounded-lg bg-[#262626] border border-[#363636] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none text-zinc-100"
				>
					<option value="all" class="text-zinc-100">All Rarities</option>
					<option value="COMMON" class="text-white">Common</option>
					<option value="UNCOMMON" class="text-green-400">Uncommon</option>
					<option value="RARE" class="text-blue-400">Rare</option>
					<option value="EPIC" class="text-purple-400">Epic</option>
					<option value="LEGENDARY" class="text-yellow-400">Legendary</option>
					<option value="MYTHIC" class="text-pink-400">Mythic</option>
					<option value="DIVINE" class="text-cyan-300">Divine</option>
					<option value="SPECIAL" class="text-red-400">Special</option>
					<option value="VERY_SPECIAL" class="text-red-500">Very Special</option>
				</select>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2 text-zinc-300">Min Dungeon Stars</label>
				<div class="flex items-center space-x-1">
					<!-- Normal stars -->
					<template v-for="i in 5" :key="`normal-star-${i}`">
						<span
							:class="[
								'cursor-pointer text-lg select-none transition-colors',
								minDungeonStars >= i ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400',
							]"
							@click="setMinDungeonStars(i)"
							>✪</span
						>
					</template>
					<!-- Master stars -->
					<template v-for="i in 5" :key="`master-star-${i}`">
						<span
							:class="[
								'cursor-pointer text-lg select-none transition-colors',
								minDungeonStars >= i + 5 ? 'text-red-400' : 'text-gray-600 hover:text-gray-400',
							]"
							@click="setMinDungeonStars(i + 5)"
							>{{ getMasterStarSymbol(i) }}</span
						>
					</template>
				</div>
				<p class="mt-1 text-xs text-zinc-500">
					Min Stars: {{ minDungeonStars > 0 ? minDungeonStars : "Any" }}
				</p>
			</div>
		</div>

		<!-- Reset filters button -->
		<div class="mt-4 flex justify-end">
			<button
				@click="resetFilters"
				class="px-4 py-2 rounded-lg border border-purple-500 text-purple-400 hover:bg-purple-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
			>
				Reset Filters
			</button>
		</div>
	</div>

	<!-- Loading state -->
	<div v-if="loading" class="flex justify-center my-12">
		<div class="flex space-x-4 items-center">
			<div
				class="h-5 w-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"
			></div>
			<p class="font-medium text-zinc-300">Loading auctions...</p>
		</div>
	</div>

	<!-- Results header -->
	<div v-if="hasSearched && !loading" class="flex justify-between items-center mb-6">
		<h2 class="text-xl font-semibold text-zinc-100">
			Search Results
			<span v-if="displayedAuctions.length > 0" class="text-sm font-normal text-zinc-400">
				({{ displayedAuctions.length }} auction{{ displayedAuctions.length !== 1 ? "s" : "" }})
			</span>
		</h2>
	</div>

	<!-- Auctions grid -->
	<div class="grid grid-cols-1 gap-5 mt-6">
		<div
			v-for="auction in displayedAuctions"
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
				:auctioneer="auctioneer"
				:expanded-auction="expandedAuction"
				:view-auctioneer="true"
			/>
		</div>
	</div>

	<!-- No results message -->
	<div
		v-if="hasSearched && displayedAuctions.length === 0 && !loading"
		class="text-center py-12 rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] shadow-md"
	>
		<p class="text-lg font-medium text-zinc-300">No auctions</p>
	</div>
</template>
