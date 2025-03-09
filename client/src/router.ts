import { createRouter, createWebHistory } from "vue-router"
import Home from "@/pages/Home.vue"
import User from "@/pages/auctions/UserAuctions.vue"

const routes = [
  { path: "/", component: Home },
  { path: "/auctions/:username", component: User },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
