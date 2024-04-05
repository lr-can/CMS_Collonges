import { createRouter, createWebHistory } from 'vue-router'


import HomeView from '../views/HomeView.vue'
import order from '../views/order.vue'
import reception from '../views/reception.vue'
import search from '../views/search.vue'
import disposition from '../views/disposition.vue'
import profile from '../views/profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/order',
      name: 'order',
      component: order
    },
    {
      path: '/disposition',
      name: 'disposition',
      component: disposition
    },
    {
      path: '/search',
      name: 'search',
      component: search
    },
    {
      path: '/reception',
      name: 'reception',
      component: reception
    },
    {
      path: '/search',
      name: 'search',
      component: search
    },
    {
      path: '/profile',
      name: 'profile',
      component: profile
    },
  ]
})

export default router
