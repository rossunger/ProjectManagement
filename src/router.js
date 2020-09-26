import {createRouter, createWebHistory} from "vue-router"
import login from './Login.vue'
import store from './Store.js'
import auth0callback from "./Auth0Callback.vue"

const routes = [
    { 
        path: '/', name: 'home', component: login
    },
    { 
        path: '/auth0callback', name: 'auth0callback', component: auth0callback, meta: {requiresAuth:false}
    },    
    //{ path: '/about', component: },
  ]
const router = createRouter({    
    history: createWebHistory(),
    routes, 
})
router.beforeEach((to, from,next)=>{
    let routerAuthCheck = false      
    if (localStorage.getItem('access_token') && localStorage.getItem('id_token') && localStorage.getItem('expires_at')){
        let expires_at = JSON.parse(localStorage.getItem('expires_at'))
        routerAuthCheck = new Date().getTime() < expires_at
    }     
    store.state.authenticated = routerAuthCheck        
    if (to.matched.some(record=>record.path == "/auth0callback")){                    
        store.dispatch('auth0HandleAuthentication')        
        next(false)
        return
    }       
    if (to.matched.some(record=>record.meta.requiresAuth)){
        if (routerAuthCheck){
            next()
        }else{
            store.state.authenticated = false
            router.replace('/')
        }
    }    
    else next();
})

export default router
