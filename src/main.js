import {createApp} from "vue";
import App from "./App.vue";
import store from "./Store.js";
import router from "./router.js"
//import vSelect from "vue-select"
const app = createApp(App)
app.use(store)
app.use(router)
app.mount("#app") 
//DEBUG VUEX:
window._state = store.state;
//app.component("v-select", vSelect)
