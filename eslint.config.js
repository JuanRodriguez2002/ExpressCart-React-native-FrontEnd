const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = defineConfig([
  // 1. Trae las reglas base de Expo
  ...expoConfig,

  // 2. Integra Prettier para que no choquen
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Activa los errores de formato de prettier como errores de ESLint
      "prettier/prettier": "error",
      // Aquí puedes agregar tus reglas personalizadas si quieres
      "no-console": "warn", // Te avisa con un warning si dejas un console.log() olvidado
    },
  },

  // 3. Aplica la configuración de desactivación de conflictos de Prettier
  prettierConfig,

  // 4. Carpetas ignoradas
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
  ,
]);
