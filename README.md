# ExpressCart - Frontend Application

## 📱 Descripción General
ExpressCart Frontend es una aplicación móvil nativa multiplataforma diseñada para optimizar y agilizar las compras en supermercados. Permite a los usuarios seleccionar establecimientos locales, gestionar su carrito de compras en tiempo real y sincronizar sus datos de perfil de manera segura. Desarrollada con **React Native** y **Expo Router**, la aplicación implementa una arquitectura desacoplada basada en el patrón **MVVM (Model-View-ViewModel)** y un sistema de navegación híbrido sofisticado.

---

## 🛠️ Stack Tecnológico
* **Framework Principal:** React Native (con Expo SDK)
* **Enrutamiento y Navegación:** Expo Router (File-based routing)
* **Gestor de Dependencias:** pnpm (migrado desde npm para optimizar la seguridad y velocidad)
* **Lenguaje:** TypeScript
* **Estilos:** StyleSheet nativo de React Native
* **Almacenamiento Local:** `SecureStore` / AsyncStorage personalizado (`tokenStorage`)

---

## 📐 Arquitectura y Patrones de Diseño

### 1. Patrón de Navegación: Combinación (Stack + Drawer)
La aplicación organiza sus flujos de pantallas utilizando un enfoque híbrido:
* **Stack Navigation:** Es la fundación provista por Expo Router. Controla las transiciones lineales del ciclo de vida de la app (ej. redirección inmediata desde el login hacia la pantalla de inicio mediante `router.replace("/")` o flujos de autenticación).
* **Drawer Navigation (Menú Lateral):** Implementado mediante un componente personalizado `<Header />` con un panel lateral (`sidebar`) animado. Permite al usuario conmutar entre las vistas principales del sistema (`/home`, `/cart`, `/profile`, `/supermarkets`).

### 2. Patrón de Arquitectura: MVVM (Model-View-ViewModel)
La estructura del código divide de manera estricta las responsabilidades para asegurar mantenibilidad:
* **Model (Modelo):** Definido por contratos de interfaces de TypeScript (ej. `Supermarket`, `UserProfile`) que estructuran las entidades de negocio, junto con los servicios (`authService`, `supermarketService`) encargados de interactuar con la capa de datos remota mediante peticiones `fetch`.
* **View (Vista):** Pantallas y componentes funcionales (`HomeScreen`, `Header`, `FormAlerts`). Su rol es estrictamente pintar la interfaz de usuario basándose en los estados proveídos.
* **ViewModel:** Centralizado dentro de los componentes funcionales mediante Hooks de React (`useState`, `useEffect`). Por ejemplo, la función `loadDashboardData` en `HomeScreen` actúa como el intermediario: despacha llamadas asíncronas en paralelo (`Promise.all`), encapsula el manejo de tokens de sesión, captura excepciones de red y muta estados reactivos de UI (`loading`, `errorMessages`).

---

## 🚀 Instalación y Configuración

### Prerrequisitos
* Node.js (versión LTS recomendada)
* pnpm instalado globalmente (`npm install -g pnpm`)
* Expo Go instalado en un dispositivo físico o emulador configurado (Android Studio / Xcode)

### Pasos para el Despliegue Local
1.  Clonar el repositorio correspondiente al frontend.
2.  Instalar las dependencias del proyecto utilizando el motor de enlaces rápidos:
    ```bash
    pnpm install
    ```
3.  Configurar las variables de entorno. Crear un archivo de configuración o modificar el punto de acceso de red en tus utilidades (`src/utils/storage` o constantes de servicios):
    ```typescript
    // Asegúrate de apuntar a la IP correcta de tu red local
    export const API_URL = "http://192.168.1.15:4000"; 
    ```
4.  Iniciar el servidor de desarrollo de Expo:
    ```bash
    pnpm expo start
    ```
5.  Escanear el código QR desde la aplicación **Expo Go** en tu dispositivo móvil o presionar `a` para Android / `i` para iOS.

---

## 🔒 Manejo de Sesiones y Seguridad
La aplicación recupera de forma asíncrona el JSON Web Token (JWT) almacenado en el inicio de sesión del usuario. 
* Las peticiones críticas inyectan el token directamente en las cabeceras HTTP mediante el estándar Bearer:
    ```typescript
    Authorization: `Bearer ${token}`
    ```
* El componente `Header` procesa el nombre del usuario de manera segura en tiempo de ejecución. Cuenta con una función defensiva `obtenerIniciales` que previene fallos ante strings vacíos o nulos, calculando de manera dinámica el badge identificador (ej. "JR" para Juan Rodríguez) mediante segmentación de expresiones regulares (`/\s+/`).

---

## 🔍 Resolución de Problemas Comunes

### Error: `fetch failed: java.net.ConnectException: Failed to connect to /192.168.1.15:4000`
Este error se presenta cuando el dispositivo móvil o emulador no logra establecer comunicación de red con el backend.
1.  **Verificación de Red:** Asegúrate de que tanto tu computadora (servidor backend) como tu celular estén conectados **exactamente a la misma red Wi-Fi**.
2.  **Actualización de IP:** Las redes domésticas cambian la IP local periódicamente. Ejecuta `ipconfig` (Windows) o `ifconfig` (Mac/Linux) en tu terminal para obtener tu dirección IPv4 actual (ej. `192.168.1.18`) y reemplázala en la constante `API_URL` del frontend.
3.  **Firewall:** Verifica que el puerto `4000` de tu computadora no esté bloqueado por políticas locales de seguridad.
