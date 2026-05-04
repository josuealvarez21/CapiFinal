# Cápi 💸 - Plataforma Integral de Control Financiero

**Cápi** es una plataforma moderna, ágil e intuitiva diseñada para proporcionar un control granular sobre las finanzas personales. Su arquitectura de software está desacoplada, separando la lógica de negocio (Backend) de la interfaz de usuario (Frontend), garantizando alta escalabilidad, seguridad en el manejo de datos e interfaces interactivas en tiempo real.

---

## 👥 Equipo de Desarrollo

- **Esteban Montoya**
- **Luis Mateo**
- **Josué Álvarez**

---

## 🛠️ Stack Tecnológico y Dependencias

El ecosistema está construido sobre un stack moderno utilizando las últimas versiones del mercado:

### Frontend (Next.js & React)
- **Framework Core:** Next.js 16.2.2 (SSR/SSG optimizado).
- **Librería UI:** React 19.2.4.
- **Estilos:** Tailwind CSS v4 (con motor PostCSS).
- **Animaciones:** Framer Motion (Transiciones fluidas y micro-interacciones).
- **Data Visualization:** Recharts (Gráficos estadísticos y paneles de control).
- **Autenticación UI:** `@react-oauth/google` (Integración con Google OAuth).
- **Iconografía:** Lucide React.

### Backend (Python & FastAPI)
- **Framework API:** FastAPI (Alto rendimiento, asíncrono y auto-documentado con Swagger/Redoc).
- **Servidor ASGI:** Uvicorn.
- **ORM & Base de Datos:** SQLAlchemy (Modelado de datos relacional) + PyMySQL (Driver para MySQL).
- **Validación de Datos (DTOs):** Pydantic & Pydantic-Settings (Tipado estricto y parsing de variables de entorno).
- **Seguridad & Auth:** 
  - PyJWT & Cryptography (Generación y validación de JSON Web Tokens).
  - Passlib con Bcrypt (Hashing y salting de contraseñas).
- **Manejo de Archivos:** Python-multipart (Procesamiento de subida de imágenes de perfil).

---

## 🏗️ Arquitectura del Sistema

El backend sigue un patrón de **Arquitectura Limpia (Clean Architecture) / Arquitectura en Capas**, separando responsabilidades de la siguiente manera (`app/`):

*   **`api/`**: Controladores y enrutadores (Endpoints). Orquesta las peticiones HTTP.
*   **`core/`**: Configuraciones globales del sistema (`settings`), middlewares (CORS) y lógica de seguridad (JWT).
*   **`crud/`**: Capa de abstracción de base de datos (Create, Read, Update, Delete). Aísla las queries SQLAlchemy de los controladores.
*   **`db/`**: Configuración del motor de conexión (`engine`) y manejo de sesiones con MySQL.
*   **`models/`**: Entidades ORM (Mapeo objeto-relacional) de SQLAlchemy representando las tablas físicas.
*   **`schemas/`**: Modelos Pydantic (Data Transfer Objects - DTOs) para validar el *payload* de entrada y salida de los endpoints.

Adicionalmente, se sirven archivos estáticos (como avatares o comprobantes) mediante la ruta montada `/static`.

---

## ⚙️ Automatización, Scripts y Pruebas

Para mantener la integridad del desarrollo, el proyecto incluye herramientas de infraestructura y validación en su raíz:

1.  **Gestión de Base de Datos:**
    *   `init_db.py`: Inicializa la estructura del esquema y sincroniza modelos de SQLAlchemy con MySQL.
    *   `fix_db.py` / `add_column.py`: Scripts de migración manual para alteraciones y correcciones en caliente del esquema de tablas.
2.  **Pruebas Automatizadas (Testing):**
    *   `test_backend.py`: Validaciones de los endpoints principales de la API.
    *   `test_signup.py`: Pruebas del flujo de registro, hashing de contraseñas y validación de usuarios duplicados.
    *   `test_dashboard.py`: Pruebas de integración sobre los cálculos y resúmenes financieros del panel de control.
3.  **Ejecución Simultánea:**
    *   `run_all.bat`: Script en lotes de Windows que audita la conexión al puerto 3306 (MySQL) y levanta de forma concurrente el servidor FastAPI en el puerto 8000 y el servidor de desarrollo Next.js en el puerto 3000.

---

## 🚀 Despliegue y Ejecución Local

1. Asegúrate de tener **MySQL** corriendo en el puerto `3306` (Puedes usar XAMPP u otro gestor).
2. Clona el repositorio y ubícate en la carpeta principal.
3. Ejecuta el archivo de arranque maestro:
   ```bash
   ./run_all.bat
   ```
4. **Endpoints disponibles:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - Swagger / Documentación API: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📌 Estado Actual

**En Construcción - Fase Avanzada:** El sistema cuenta con autenticación robusta, ORM configurado, arquitectura de base de datos sincronizada, endpoints operativos de transacciones/dashboard y un frontend dinámico consumiendo la API de manera asíncrona.
