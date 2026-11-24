import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettierConfig from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default defineConfigWithVueTs(
  {
    name: 'app/ignores',
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'docs/**'],
  },
  {
    name: 'app/globals',
    languageOptions: { globals: { ...globals.browser } },
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.strictTypeChecked,
  {
    name: 'app/config-files',
    files: ['*.config.js', '*.config.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettierConfig,
)
