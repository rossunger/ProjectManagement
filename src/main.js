import {createApp} from "vue";
import App from "./App.vue";
import store from "./Store.js";
//import vSelect from "vue-select"
import io from 'socket.io-client'
import {baseurl} from "./PostService"
const app = createApp(App)
app.use(store)


const socket = io(baseurl)
app.config.globalProperties.$socket = socket
app.mount("#app") 
//DEBUG VUEX:
window._state = store.state;
//app.component("v-select", vSelect)
