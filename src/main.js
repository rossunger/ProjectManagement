import {createApp} from "vue";
import App from "./App.vue";
import store from "./Store.js";
import vSelect from "vue-select"
const app = createApp(App)
app.use(store)
app.mount("#app") 
//app.component("v-select", vSelect)
