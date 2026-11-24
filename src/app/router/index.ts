import { createRouter, createWebHistory } from 'vue-router'
import PlaceholderPage from '../pages/PlaceholderPage.vue'

export const routes = [{ path: '/', name: 'placeholder', component: PlaceholderPage }]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
