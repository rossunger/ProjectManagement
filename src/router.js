import {createRouter, createWebHistory} from "vue-router"
import home from './home.vue'
import store from './Store.js'
import auth0callback from "./Auth0Callback.vue"

const routes = [
    { 
        path: '/', name: 'home', component: home
    },
    { 
        path: '/tasks', name: 'tasks', component: home
    },
    { 
        path: '/people', name: 'people', component: home
    },
    { 
        path: '/events', name: 'events', component: home
    },
    { 
        path: '/gantt', name: 'gantt', component: home
    },
    { 
        path: '/paste', name: 'paste', component: home
    },    
    { 
        path: '/tags', name: 'tags', component: home
    },
    { 
        path: '/overview', name: 'overview', component: home
    },    
    { 
        path: '/calendar', name: 'calendar', component: home
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
    if(!store.state.currentUser) $store.state.currentUser = this.$store.getters.personByEmail(localStorage.getItem('current_user')) || undefined
    if (localStorage.getItem('access_token') && localStorage.getItem('id_token') && localStorage.getItem('expires_at')){        
        let expires_at = JSON.parse(localStorage.getItem('expires_at'))
        routerAuthCheck = new Date().getTime() < expires_at
    }     
    store.state.authenticated = routerAuthCheck                    
    if (store.state.debug =='debug') store.state.authenticated = true;
    if (to.matched.some(record=>record.path == "/auth0callback")){                                    
        store.dispatch('auth0HandleAuthentication')        
        next(false)
        return
    }         
    if (to.matched.some(record=>record.path == "/tasks")){                    
        store.state.viewMode="tasks"     
    }
    if (to.matched.some(record=>record.path == "/people")){                    
        store.state.viewMode="people"        
    }
    if (to.matched.some(record=>record.path == "/events")){                    
        store.state.viewMode="events"        
    }
    if (to.matched.some(record=>record.path == "/calendar")){                    
        store.state.viewMode="calendar"     
    }
    if (to.matched.some(record=>record.path == "/paste")){                    
        store.state.viewMode="paste"     
    }
    if (to.matched.some(record=>record.path == "/tags")){                    
        store.state.viewMode="tags"     
    }
    if (to.matched.some(record=>record.path == "/overview")){                    
        store.state.viewMode="overview"     
    }
    if (to.matched.some(record=>record.path == "/gantt")){                    
        store.state.viewMode="gantt"     
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
