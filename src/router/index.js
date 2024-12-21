import { createRouter, createWebHistory } from 'vue-router'


import HomeView from '../views/HomeView.vue'
import orderView from '../views/orderView.vue'
import receptionView from '../views/receptionView.vue'
import searchView from '../views/searchView.vue'
import dispositionView from '../views/dispositionView.vue'
import profileView from '../views/profileView.vue'
import asupGrandPublic from '@/views/asupGrandPublic.vue'
import expiryAsup from '@/views/expiryAsup.vue'
import reportAsup from '@/views/reportAsup.vue'
import replaceAsup from '@/views/replaceAsup.vue'
import formationSearch from '@/views/formationSearch.vue'
import formationSearchAgent from '@/views/formationSearchAgent.vue'
import telexView from '@/views/telexView.vue'

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
    {
      path: '/asupGrandPublic',
      name: 'asupGrandPublic',
      component: asupGrandPublic
    },
    {
      path: '/expiryAsup',
      name: 'expiryAsup',
      component: expiryAsup
    },
    {
      path: '/reportAsup',
      name: 'reportAsup',
      component: reportAsup
    },
    {
      path: '/replaceAsup',
      name: 'replaceAsup',
      component: replaceAsup
    },
    {
      path: '/formationSearch',
      name: 'formationSearch',
      component: formationSearch
    },
    {
      path: '/formationSearchAgent',
      name: 'formationSearchAgent',
      component: formationSearchAgent
    },
    {
      path: '/telex',
      name: 'telex',
      component: telexView
    }
  ]
})

export default router
