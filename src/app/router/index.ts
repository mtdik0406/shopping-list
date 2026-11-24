import { createRouter, createWebHistory } from 'vue-router'
import PlaceholderPage from '../pages/PlaceholderPage.vue'

// ルートガードはUXのためのもので、認可はSecurity Rulesが担う（UI_DESIGN 3.3）。
export const routes = [{ path: '/', name: 'placeholder', component: PlaceholderPage }]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
