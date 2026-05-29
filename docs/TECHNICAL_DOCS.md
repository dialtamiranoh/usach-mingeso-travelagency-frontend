# TravelAgency — Documentación Técnica

## 1. Descripción General

TravelAgency es una plataforma web para la comercialización de paquetes turísticos nacionales e internacionales. Permite a clientes consultar, reservar y pagar paquetes de forma autónoma, mientras que los administradores gestionan el catálogo, reservas, pagos y reportes.

### Módulos implementados

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | Administración de Usuarios | Registro, login y gestión de perfiles via Keycloak |
| 2 | Gestión de Paquetes Turísticos | CRUD de paquetes, control de estados y cupos |
| 3 | Consulta de Paquetes | Búsqueda y filtrado público sin autenticación |
| 4 | Reservas | Proceso de reserva con cálculo de descuentos y expiración automática |
| 5 | Pagos | Flujo de pago simulado con tarjeta de crédito |
| 6 | Consulta de Reservas | Seguimiento de reservas y generación de comprobantes |
| 7 | Reportes | Ventas por período y ranking de paquetes |

---

## 2. Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Backend | Spring Boot | 4.0.6 |
| Build tool | Gradle | 8.14 (Groovy) |
| Lenguaje | Java | 21 |
| Base de datos | PostgreSQL | 15 |
| ORM | Spring Data JPA / Hibernate | — |
| Autenticación | Keycloak | 26.6.2 |
| Frontend | ReactJS + Vite | — |
| Estilos | Bootstrap | 5.3 |
| Proxy / LB | Nginx | alpine |
| Contenedores | Docker Compose | v5.1.4 |
| CI/CD | GitHub Actions | — |
| Registry | DockerHub | — |
| Nube | AWS EC2 | t3.medium |

---

## 3. Arquitectura

El sistema sigue una **arquitectura monolítica por capas** con el siguiente flujo de requests:

```
Browser → Nginx (:80)
            ├── location /     → Frontend React (nginx:5173)
            └── location /api  → Backend 1/2/3 (round-robin :8081-8083)
                                    └── PostgreSQL (:5432)

Browser → Keycloak (:9090) → JWT → Backend (validación)
```

El frontend **no llama directamente al backend**. Todas las requests API pasan por Nginx en el puerto 80, que actúa como reverse proxy y balanceador de carga simultáneamente.

Ver diagrama completo: `architecture.puml`

### Componentes Docker

| Contenedor | Imagen | Puerto | Memoria |
|-----------|--------|--------|---------|
| nginx | nginx:alpine | 80 | 128MB |
| backend1 | travelagency-backend:latest | 8081 | 512MB |
| backend2 | travelagency-backend:latest | 8082 | 512MB |
| backend3 | travelagency-backend:latest | 8083 | 512MB |
| frontend | travelagency-frontend:latest | 5173 | 128MB |
| postgres | postgres:15 | 5432 | 512MB |
| keycloak | keycloak:26.6.2 | 9090 | 768MB |

### Decisión: t3.small vs t3.medium

Durante el despliegue inicial se utilizó una instancia `t3.small` (2GB RAM). Con todos los contenedores corriendo simultáneamente — especialmente Keycloak que consume ~550MB y los 3 backends con ~300MB cada uno — la instancia se quedaba sin memoria disponible causando crash loops en los backends. Se migró a `t3.medium` (4GB RAM) lo que estabilizó completamente el sistema con ~1.8GB de uso total.

---

## 4. Reglas de Negocio Implementadas

### 4.1 Gestión de Usuarios

- El correo electrónico del usuario debe ser único — validado por Keycloak.
- No se puede registrar un usuario sin nombre completo, correo electrónico y contraseña — validado por Keycloak.
- La contraseña debe cumplir longitud mínima y criterios de seguridad — configurado en Keycloak.
- El sistema valida el formato del correo electrónico antes de registrar — validado por Keycloak.
- Un usuario solo puede iniciar sesión si su cuenta se encuentra activa — implementado mediante `UserStatusFilter` en el backend (ver sección 10.1).
- Un cliente solo puede modificar sus propios datos personales — implementado via `ProtectedRoute` y verificación de `keycloakId`.
- No se elimina físicamente la cuenta de un usuario con historial de reservas — validado en `UserService.deleteById()`, retorna error si tiene reservas asociadas.
- Bloqueo tras intentos fallidos de autenticación — configurado en Keycloak (política de brute force).

### 4.2 Paquetes Turísticos

- Todo paquete debe tener nombre, destino, descripción, fecha de inicio, fecha de término, precio y cupos definidos — validado con `@Column(nullable = false)` en la entidad.
- El precio del paquete debe ser mayor que cero — validado en `TouristPackageService.validatePackage()`.
- La fecha de término debe ser posterior a la fecha de inicio — validado en `TouristPackageService.validatePackage()`.
- Los cupos totales deben ser mayores que cero — validado en `TouristPackageService.validatePackage()`.
- Un paquete no puede publicarse como disponible si no tiene cupos — el estado `AVAILABLE` requiere `availableSlots > 0`.
- Al agotarse los cupos, el sistema cambia automáticamente el estado del paquete a `SOLD_OUT`.
- Al liberarse cupos por cancelación, si el paquete estaba `SOLD_OUT` vuelve automáticamente a `AVAILABLE`.
- Un paquete con reservas activas (`PENDING_PAYMENT` o `CONFIRMED`) no puede eliminarse — validado en `TouristPackageService.deleteById()`.
- Si un paquete tiene reservas activas, no pueden modificarse sus fechas base ni reducirse los cupos totales por debajo de los ya reservados — validado en `TouristPackageService.update()`.

**Estados del paquete:**
```
AVAILABLE → SOLD_OUT   (cupos agotados — automático)
          → CANCELLED  (cancelación manual por admin)
SOLD_OUT  → AVAILABLE  (cupos liberados — automático)
```

### 4.3 Reservas

#### Validaciones operativas
- Solo un usuario autenticado puede crear una reserva.
- Una reserva debe estar asociada a un cliente y a un paquete turístico existente.
- La cantidad de pasajeros debe ser mayor que cero.
- No se puede reservar si los cupos disponibles son insuficientes.
- No se puede reservar un paquete que no esté en estado `AVAILABLE`.
- Al crear una reserva válida, se descuentan los cupos del paquete inmediatamente.
- Toda reserva se crea con estado inicial `PENDING_PAYMENT` y `expiresAt = now + 24h`.
- Los estados `CANCELLED` y `EXPIRED` son finales — no se pueden modificar.
- El estado `EXPIRED` solo puede asignarlo el sistema automáticamente.

#### Expiración automática
Un job schedulado (`@Scheduled`) corre cada 60 segundos y:
1. Busca reservas en estado `PENDING_PAYMENT` con `expiresAt <= now`
2. Cambia su estado a `EXPIRED`
3. Libera los cupos del paquete correspondiente

#### Flujo de estados
```
Crear reserva → PENDING_PAYMENT (expiresAt = now + 24h)
    ↓ pagar              ↓ no pagar (job cada 60s)
CONFIRMED            EXPIRED (cupos liberados)

Cancelar desde PENDING_PAYMENT o CONFIRMED → CANCELLED (cupos liberados)
CANCELLED y EXPIRED son estados finales
```

#### Cálculo del monto
```
baseAmount  = precio_paquete × cantidad_pasajeros
discountAmt = baseAmount × totalDiscountPct / 100
finalAmount = baseAmount - discountAmt  (mínimo 0)
```

### 4.4 Promociones y Descuentos

#### Tipos de descuento
| Tipo | Campo | Criterio |
|------|-------|----------|
| Por grupo | `minPassengers` | passengerCount ≥ minPassengers |
| Cliente frecuente | `minBookingsHistory` | reservas confirmadas históricas ≥ N |
| Multi-paquete sesión | `minBookingsSession` | reservas en la última hora ≥ N |

#### Reglas de acumulación
- Si `isAccumulable = true`: el descuento se suma al total acumulado.
- Si `isAccumulable = false`: solo se aplica el primer descuento no acumulable encontrado.
- Los descuentos acumulables y no acumulables pueden coexistir en una misma reserva.
- El descuento total acumulado tiene un límite máximo hardcodeado de **20%** del monto base. Si la suma supera este límite, se trunca a 20%.
- El monto final nunca puede ser negativo.

#### Condiciones de aplicación
Una promoción aplica si su estado es `ACTIVE`, la fecha actual está dentro del rango `[startDate, endDate]` y el paquete turístico tiene la promoción asociada.

### 4.5 Pagos

- Todo pago debe estar asociado a una reserva existente.
- Solo se puede pagar una reserva en estado `PENDING_PAYMENT`.
- No se puede registrar un pago si la reserva ya tiene uno previo.
- No se puede pagar una reserva expirada.
- El monto del pago corresponde exactamente al `finalAmount` de la reserva — sin pagos parciales.
- El sistema asume que todo pago es exitoso (pago simulado) — sin rechazo de transacciones.
- Al confirmar el pago se genera un `transactionCode` UUID único y la reserva cambia a `CONFIRMED`.
- El estado del pago queda como `APPROVED` inmediatamente.

### 4.6 Reportes

- El usuario debe ingresar fecha de inicio y fecha de término para generar reportes.
- La fecha de inicio no puede ser posterior a la fecha de término — validado en `ReportController`.
- Solo deben incluirse reservas no canceladas dentro del período seleccionado.
- El ranking agrupa ventas por paquete turístico, ordenado por cantidad de reservas DESC, nombre ASC en empate.
- Solo usuarios con rol `ADMIN` pueden acceder a los reportes.

---

## 5. Backend

### Estructura de paquetes

```
com.travelagency.travelagency_backend/
├── config/
│   ├── SecurityConfig.java
│   ├── UserStatusFilter.java
│   └── BookingExpirationJob.java
├── controller/          ← 12 controllers REST
├── entity/              ← 11 entidades JPA
├── repository/          ← 11 repositorios Spring Data
└── service/             ← 11 servicios de negocio
```

### Seguridad

Se usa Keycloak como proveedor de identidad (IAM). El backend actúa como **OAuth2 Resource Server** — valida tokens JWT emitidos por Keycloak.

#### Roles

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Acceso completo al sistema |
| `CUSTOMER` | Acceso restringido a sus propios datos |

#### Endpoints públicos vs protegidos

**Decisión**: Se habilitaron endpoints de solo lectura sin autenticación para permitir la navegación pública de paquetes turísticos sin necesidad de login.

| Endpoint | Acceso |
|----------|--------|
| `GET /api/tourist-packages/available` | Público |
| `GET /api/tourist-packages/{id}` | Público |
| `GET /api/destinations` | Público |
| `GET /api/categories` | Público |
| `GET /api/package-types` | Público |
| `POST /api/bookings/create` | ADMIN, CUSTOMER |
| `GET /api/bookings/keycloak/{id}` | ADMIN, CUSTOMER |
| `GET /api/reports/*` | Solo ADMIN |

**Tradeoff**: Abrir endpoints públicos simplifica la experiencia del usuario pero expone información del catálogo sin autenticación. Para este dominio es aceptable ya que la información es pública por naturaleza.

---

## 6. Frontend

### Estructura de componentes

```
src/
├── components/
│   ├── HeaderFooter.jsx    ← Navbar sticky + footer + toggle sidebar
│   ├── Sidebar.jsx         ← Offcanvas con links según rol
│   ├── PackageCard.jsx     ← Tarjeta de paquete reutilizable
│   ├── FilterBar.jsx       ← Filtros collapse para Home
│   ├── BookingTable.jsx    ← Tabla de reservas
│   ├── DualListBox.jsx     ← Selector de servicios/promociones
│   └── RequiredLabel.jsx   ← Label con asterisco rojo
├── pages/
│   ├── Home.jsx            ← Catálogo público con búsqueda
│   ├── admin/              ← 13 páginas de administración
│   └── customer/           ← PackageDetail, MyBookings, MyBookingDetail, Profile
└── services/               ← 12 servicios Axios
```

### Decisión: check-sso vs login-required

Inicialmente se usó `onLoad: 'login-required'` que forzaba autenticación antes de cualquier página. Se cambió a `onLoad: 'check-sso'` para permitir navegación pública.

**Tradeoff**: `check-sso` requiere el archivo `public/silent-check-sso.html` para verificación silenciosa de sesión. Sin HTTPS, la Web Crypto API no está disponible, lo que impide el flujo PKCE de Keycloak. Se resolvió deshabilitando PKCE en el cliente Keycloak.

### Protección de rutas

```jsx
<Route path="/" element={<Home />} />                                        // Público
<Route path="/customer/packages/:id" element={<PackageDetail />} />          // Público
<Route path="/admin/*" element={<ProtectedRoute role="ADMIN">...</ProtectedRoute>} />
<Route path="/my-bookings" element={<ProtectedRoute>...</ProtectedRoute>} />
```

### Creación automática de usuarios

Al primer login, el `tokenLogger` en `main.jsx` detecta que el usuario no existe en la BD (404) y crea su perfil automáticamente con los datos del token JWT. Se implementó un flag `userCreationInProgress` para evitar una race condition donde dos llamadas simultáneas intentaban crear el mismo usuario causando un error 500.

---

## 7. Base de Datos

### StatusEntity compartida

**Decisión**: Se implementó una única tabla `statuses` con un campo `entityType` para centralizar todos los estados del sistema.

| entityType | Estados posibles |
|-----------|-----------------|
| PACKAGE | AVAILABLE, SOLD_OUT, CANCELLED |
| BOOKING | PENDING_PAYMENT, CONFIRMED, CANCELLED, EXPIRED |
| PAYMENT | APPROVED |
| USER | ACTIVE, INACTIVE |
| CATEGORY, SEASON, DESTINATION, PACKAGE_TYPE, SERVICE | ACTIVE, INACTIVE |
| PROMOTION | ACTIVE, INACTIVE, EXPIRED |

**Tradeoff**: Mayor flexibilidad para agregar nuevos estados sin migraciones de esquema, pero requiere que los estados base existan en la BD antes de que la aplicación funcione.

### Problema del init.sql

**Problema**: Al crear un usuario via Keycloak por primera vez, `UserService.save()` asigna automáticamente el estado `ACTIVE` buscándolo en la tabla `statuses`. Si la BD no tiene ese estado pre-cargado, el insert falla con error de constraint `NOT NULL` en `status_id`.

**Solución**: Se creó un archivo `init.sql` que PostgreSQL ejecuta automáticamente al inicializarse por primera vez (via `/docker-entrypoint-initdb.d/`), insertando todos los estados necesarios para el funcionamiento del sistema.

---

## 8. CI/CD Pipeline

Ver diagrama completo: `cicd.puml`

### Flujo

```
git push → GitHub Actions → Tests (JUnit) → Build JAR →
Docker Build → Push DockerHub → SSH AWS → docker-compose pull → up -d
```

### Secrets configurados

| Secret | Descripción |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Usuario DockerHub |
| `DOCKERHUB_TOKEN` | PAT con permisos Read & Write |
| `EC2_HOST` | IP elástica AWS: 3.209.159.160 |
| `EC2_USER` | ec2-user |
| `EC2_KEY` | Contenido del archivo .pem |
| `VITE_BACKEND_SERVER` | IP del backend para el build del frontend |
| `VITE_KEYCLOAK_URL` | URL de Keycloak para el build del frontend |

### Variables de entorno en build del frontend

**Problema**: Vite inyecta las variables de entorno en tiempo de build — no en runtime. El archivo `.env` local apunta a `localhost` y no puede subirse al repositorio.

**Solución**: Las variables de entorno de producción se almacenan como GitHub Secrets y se inyectan durante el pipeline creando el archivo `.env` antes del build de Docker.

### Actualización automática de contenedores

Todos los servicios tienen `restart: always` en el `docker-compose.yml`, garantizando que los contenedores se reinicien automáticamente si el proceso falla o la instancia se reinicia. El pipeline siempre ejecuta `docker-compose pull` antes de `docker-compose up -d`, garantizando que se descargue la imagen más reciente desde DockerHub.

### Decisión: Tests unitarios vs integración

Se optó por tests unitarios con Mockito en la capa de servicios por las siguientes razones:

- Spring Boot 4.0.6 removió `@WebMvcTest` del paquete tradicional, dificultando tests de controllers ligeros.
- Tests de integración requieren Keycloak corriendo en el pipeline, aumentando el tiempo de ejecución.
- Tests unitarios con Mockito son más rápidos, predecibles y cubren la lógica de negocio crítica.

---

## 9. Testing

### Herramientas

| Herramienta | Uso |
|------------|-----|
| JUnit 5 | Framework de testing |
| Mockito | Mocking de dependencias |
| MockMvc | Testing de endpoints HTTP |
| JaCoCo | Reporte de cobertura de código |

### Cobertura por capa

**Capa de Servicios** — `BookingServiceTest`, `PaymentServiceTest`:
- `createBooking`: usuario no encontrado, paquete no disponible, cupos insuficientes, pasajeros inválidos, descuento por grupo, descuento máximo 20%, último cupo (SOLD_OUT)
- `updateBooking`: éxito, estado final (CANCELLED/EXPIRED), cancelación libera cupos
- `processPayment`: éxito, reserva no encontrada, estado incorrecto, pago duplicado, reserva expirada, código de transacción único

**Capa de Controllers** — `UserControllerTest`:
- Todos los endpoints: findAll, findById, findByKeycloakId, save, update, deleteById
- Casos: 200 OK, 404 Not Found, 201 Created, 204 No Content
- Seguridad: roles ADMIN y CUSTOMER con `@WithMockUser`

---

## 10. Decisiones y Tradeoffs

### 10.1 Dualidad Keycloak — BD propia y bloqueo de usuarios inactivos

El sistema mantiene dos fuentes de identidad en paralelo: **Keycloak** gestiona autenticación, sesiones y tokens JWT; **UserEntity** en PostgreSQL gestiona datos de perfil, estado y relación con reservas.

**Problema**: Cuando un usuario se loguea, Keycloak valida las credenciales y emite el JWT sin consultar la BD propia. Si el usuario tiene estado `INACTIVE` en la BD, igual puede autenticarse en Keycloak.

**Solución implementada en dos capas**:

1. **Backend** — `UserStatusFilter` (`OncePerRequestFilter`): en cada request autenticada, extrae el `keycloakId` del JWT, consulta `UserEntity.status` en la BD y retorna **401** si el usuario está `INACTIVE`.

2. **Frontend** — interceptor de response en `http-common.js`: detecta cualquier respuesta **401** y ejecuta `keycloak.logout()` automáticamente, redirigiendo al usuario al inicio público.

**Flujo resultante**:
```
Usuario INACTIVE → login Keycloak (exitoso) → request API →
UserStatusFilter → 401 → interceptor Axios → keycloak.logout() → inicio público
```

**Tradeoff**: El usuario INACTIVE puede loguearse en Keycloak y obtener un JWT válido, pero no puede usar ninguna funcionalidad de la aplicación. Mientras el token esté vigente (~5 minutos), un usuario avanzado podría hacer requests directas con el token via herramientas como Postman o curl. La solución completa requeriría deshabilitar el usuario también en Keycloak via Admin REST API, sincronizando ambos sistemas. Esta integración fue evaluada y descartada para esta iteración por su complejidad y riesgo de introducir errores en el flujo de autenticación existente.

### 10.2 Validaciones de negocio en capa de servicio vs entity

Las validaciones de negocio (precio > 0, cupos > 0, fechas coherentes) se implementaron en `TouristPackageService.validatePackage()` en lugar de usar anotaciones Bean Validation (`@Positive`, `@AssertTrue`) en la entidad.

**Tradeoff**: Permite mensajes de error personalizados en español y mayor control del flujo, pero si alguien llama al repositorio directamente sin pasar por el servicio, las validaciones se saltean. Requiere agregar `spring-boot-starter-validation` para validaciones automáticas en la entity.

### 10.3 HTTP vs HTTPS

El sistema está desplegado en HTTP. Esto genera dos limitaciones:

1. **Web Crypto API**: Keycloak JS requiere HTTPS para el flujo PKCE. Se resolvió deshabilitando PKCE en el cliente Keycloak.
2. **Cookies**: Keycloak advierte que las cookies no son seguras en contexto HTTP.

Para producción real se requeriría HTTPS con certificado SSL (Let's Encrypt o ACM de AWS).

### 10.4 Keycloak 26.6.2 — Compatibilidad de versiones

Al importar el realm desde Keycloak local (26.6.2) a una instancia Docker con versión 26.0.0, el import falló con errores de campos no reconocidos. La solución fue actualizar la imagen Docker a la misma versión.

**Lección**: Siempre usar la misma versión de Keycloak entre ambientes para garantizar compatibilidad de configuración.

### 10.5 Spring Boot 4.0.6 — Impacto en testing

Spring Boot 4.0.6 introduce cambios breaking en el módulo de testing:
- `@MockBean` reemplazado por `@MockitoBean`
- `@WebMvcTest` removido del paquete tradicional
- `ObjectMapper` no se autoconfigura en contextos `@SpringBootTest` sin web layer completo

Estos cambios requirieron adaptar los tests para usar `@SpringBootTest` con `MockMvcBuilders.webAppContextSetup()` e instanciar `ObjectMapper` manualmente.

### 10.6 Filtrado de paquetes disponibles en memoria

El endpoint `GET /api/tourist-packages/available` originalmente usaba una query JPQL con múltiples parámetros opcionales. PostgreSQL no podía determinar el tipo de los parámetros nulos en la query (`could not determine data type of parameter`).

**Solución**: Se cambió a cargar todos los paquetes `AVAILABLE` con una query simple y filtrar en memoria con Java Streams. 

**Tradeoff**: Mayor consumo de memoria en catálogos grandes, pero elimina la complejidad de la query dinámica y los problemas de tipos nulos con PostgreSQL.

---

## 11. URLs y Repositorios

| Recurso | URL |
|---------|-----|
| Sistema desplegado | http://3.209.159.160 |
| Keycloak Admin | http://3.209.159.160:9090 |
| Swagger UI | http://3.209.159.160:8081/swagger-ui.html |
| Backend repo | https://github.com/dialtamiranoh/usach-mingeso-travelagency-backend |
| Frontend repo | https://github.com/dialtamiranoh/usach-mingeso-travelagency-frontend |
| DockerHub | https://hub.docker.com/u/dialtamiranoh |
