<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const currentPath = computed(() => route.path)

const pages = [
	{ title: "Home", path: "/" },
	{ title: "About", path: "/about" },
	{ title: "Auctions", path: "/auctions" },
	{ title: "Github", path: "https://github.com/unloopedmido/hytools", external: true },
]

const mobileMenu = ref(false)
let menuToggleTimeout: number | null = null

// Fix flickering by using setTimeout to prevent rapid toggling
const toggleMobileMenu = () => {
	if (menuToggleTimeout !== null) {
		clearTimeout(menuToggleTimeout)
		menuToggleTimeout = null
	} else {
		mobileMenu.value = !mobileMenu.value
		menuToggleTimeout = window.setTimeout(() => {
			menuToggleTimeout = null
		}, 300) // 300ms debounce
	}
}

// Close mobile menu when clicking outside
const handleOutsideClick = (event: MouseEvent) => {
	const nav = document.querySelector("nav")
	if (mobileMenu.value && nav && !nav.contains(event.target as Node)) {
		mobileMenu.value = false
		menuToggleTimeout = null
	}
}

// Close mobile menu on escape key
const handleEscKey = (event: KeyboardEvent) => {
	if (mobileMenu.value && event.key === "Escape") {
		mobileMenu.value = false
		menuToggleTimeout = null
	}
}

onMounted(() => {
	document.addEventListener("click", handleOutsideClick)
	document.addEventListener("keydown", handleEscKey)
})

onBeforeUnmount(() => {
	document.removeEventListener("click", handleOutsideClick)
	document.removeEventListener("keydown", handleEscKey)
	if (menuToggleTimeout !== null) {
		clearTimeout(menuToggleTimeout)
	}
})

const isActive = (path: string) => {
	if (path === "/") return currentPath.value === "/"
	return path !== "/" && currentPath.value.startsWith(path)
}
</script>

<template>
	<nav class="sticky top-0 z-50 backdrop-blur-md shadow-md">
		<div class="p-4 max-w-6xl w-full mx-auto flex justify-between items-center relative">
			<RouterLink
				to="/"
				class="font-bold uppercase text-purple-400 tracking-wide flex items-center gap-2 group"
			>
				<div
					class="w-6 h-6 bg-purple-400 rounded-md flex items-center justify-center group-hover:bg-purple-300 transition-all"
				>
					<span class="text-[#121212] font-bold text-sm">H</span>
				</div>
				<span class="group-hover:text-purple-300 transition-colors">HyTools</span>
			</RouterLink>
			<button
				@click="toggleMobileMenu"
				class="md:hidden focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-md p-1.5 hover:bg-white/5 transition-colors"
				aria-label="Toggle mobile menu"
			>
				<v-icon name="co-menu" class="text-white size-5" />
			</button>

			<!-- Mobile menu -->
			<div
				v-show="mobileMenu"
				class="absolute top-full left-0 right-0 bg-[#1a1a1a] border-t border-b border-gray-800 shadow-lg p-2 z-50 md:hidden"
				:class="{ 'animate-fade-in': mobileMenu }"
			>
				<ul class="flex flex-col">
					<li
						v-for="page in pages"
						:key="page.path"
						class="border-b border-gray-800/50 last:border-0"
					>
						<RouterLink
							v-if="!page.external"
							class="transition-colors text-sm font-light hover:bg-white/10 block px-4 py-3 rounded-md"
							:class="{ 'bg-purple-400/10 text-purple-300': isActive(page.path) }"
							:to="page.path"
							@click="mobileMenu = false"
							>{{ page.title }}</RouterLink
						>
						<a
							v-else
							class="transition-colors text-sm font-light hover:bg-white/10 block px-4 py-3 rounded-md"
							:href="page.path"
							target="_blank"
							rel="noopener noreferrer"
							@click="mobileMenu = false"
							>{{ page.title }}
						</a>
					</li>
				</ul>
			</div>

			<!-- Desktop menu -->
			<ul class="hidden md:flex gap-x-1 items-center">
				<li v-for="page in pages" :key="page.path">
					<RouterLink
						v-if="!page.external"
						class="transition-all duration-200 text-sm font-medium hover:bg-white/10 px-4 py-2 rounded-md relative"
						:class="{ 'text-purple-300': isActive(page.path) }"
						:to="page.path"
					>
						{{ page.title }}
						<div
							v-if="isActive(page.path)"
							class="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 mx-4"
						></div>
					</RouterLink>
					<a
						v-else
						class="transition-colors text-sm font-medium hover:bg-white/10 px-4 py-2 rounded-md flex items-center"
						:href="page.path"
						target="_blank"
						rel="noopener noreferrer"
						>{{ page.title }}
					</a>
				</li>
			</ul>
		</div>
	</nav>
</template>

<style scoped>
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-fade-in {
	animation: fadeIn 0.2s ease-in-out forwards;
}
</style>
