import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import pluginQuery from '@tanstack/eslint-plugin-query'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `.claude/` guarda worktrees de otras sesiones (copias enteras de src/): sin
  // esto eslint las recorre y el lint falla por código que no es el de acá.
  globalIgnores(['dist', '.claude/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // Estaba en devDependencies pero sin cablear: sus reglas vigilan justo la
      // capa de datos (keys inestables, deps de queryKey).
      ...pluginQuery.configs['flat/recommended'],
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Boilerplate de shadcn: estos archivos exportan las variantes CVA junto al
    // componente (badge, button, form). La regla de fast-refresh es ruido acá,
    // no una señal — y silenciarla solo en esta carpeta deja que siga avisando
    // en el código propio, donde sí importa.
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
