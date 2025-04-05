<script setup lang="ts">
import NavigationBar from "./components/NavigationBar.vue"
</script>

<template>
	<div class="flex flex-col bg-[#121212] text-zinc-100 min-h-screen h-full">
		<NavigationBar />
		<div class="flex-1 max-w-5xl w-full mx-auto py-12 px-4 sm:px-6">
			<RouterView />
		</div>
	</div>
</template>

<style>
* {
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
}

*::-webkit-scrollbar {
	display: none;
}
</style>
