import "./styles/main.css"

import { createApp } from "vue"
import App from "./App.vue"
import { BiSearch, BiFilter } from "oh-vue-icons/icons"
import { CoMenu, CoX } from "oh-vue-icons/icons";
import { addIcons, OhVueIcon } from "oh-vue-icons"
import router from "./router"

addIcons(BiSearch, BiFilter, CoMenu, CoX)

const app = createApp(App)
app.component("v-icon", OhVueIcon)
app.use(router)
app.mount("#app")
