import { createRouter, createWebHistory } from 'vue-router'


import HomeView from '../views/HomeView.vue'
import orderView from '../views/orderView.vue'
import receptionView from '../views/receptionView.vue'
import searchView from '../views/searchView.vue'
import dispositionView from '../views/dispositionView.vue'
import profileView from '../views/profileView.vue'

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
      component: orderView
    },
    {
      path: '/disposition',
      name: 'disposition',
      component: dispositionView
    },
    {
      path: '/search',
      name: 'search',
      component: searchView
    },
    {
      path: '/reception',
      name: 'reception',
      component: receptionView
    },
    {
      path: '/profile',
      name: 'profile',
      component: profileView
    },
  ]
})

export default router
