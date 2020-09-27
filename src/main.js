import {createApp} from "vue";
import App from "./App.vue";
import store from "./Store.js";
//import vSelect from "vue-select"
import io from 'socket.io-client'
import {baseurl} from "./PostService"
import router from "./router.js"
const app = createApp(App)
app.use(store)

app.use(router)


const socket = io(baseurl, {query: { env: process.env.VUE_APP_ENV }}) 
app.config.globalProperties.$socket = socket
app.mount("#app") 
//DEBUG VUEX:
window._state = store.state;
//app.component("v-select", vSelect)
