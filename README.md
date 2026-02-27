# Budget Tracker - Gestión de Presupuestos Personales

Aplicación fullstack para gestionar presupuestos personales con soporte para periodos mensuales/quincenales, categorías, gráficos interactivos, alertas de presupuesto e internacionalización.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 17, Angular Material, ApexCharts, ngx-translate |
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT |
| Base de datos | PostgreSQL 16 |
| Docs API | Swagger / OpenAPI 3 (SpringDoc) |
| CI/CD | GitHub Actions |
| Contenedores | Docker, Docker Compose |

## Estructura del Proyecto

```
track/
├── backend/                        # API REST (Spring Boot)
│   ├── src/main/java/com/budget/api/
│   │   ├── config/                 # Seguridad, CORS, Swagger
│   │   ├── controller/             # REST Controllers
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── entity/                 # Entidades JPA
│   │   ├── enums/                  # Enumeraciones
│   │   ├── exception/              # Manejo centralizado de errores
│   │   ├── mapper/                 # MapStruct mappers
│   │   ├── repository/            # Spring Data JPA repositories
│   │   ├── security/              # JWT, filtros, utilidades
│   │   └── service/               # Lógica de negocio
│   ├── src/main/resources/         # Configs (YAML por perfil)
│   ├── src/test/                   # Tests (JUnit 5 + Mockito)
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                       # SPA (Angular)
│   ├── src/app/
│   │   ├── core/                   # Servicios, guards, interceptors, modelos
│   │   ├── features/               # Módulos por feature
│   │   │   ├── auth/               # Login, registro
│   │   │   ├── dashboard/          # Dashboard con gráficos
│   │   │   ├── budgets/            # CRUD presupuestos
│   │   │   ├── transactions/       # CRUD transacciones
│   │   │   ├── categories/         # Gestión de categorías
│   │   │   └── settings/           # Idioma y moneda
│   │   └── shared/                 # Pipes, componentes compartidos
│   ├── src/assets/i18n/            # Archivos de traducción (es, en)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

## Levantar en Local

### Opción 1: Docker Compose (recomendado)

```bash
# Clonar el proyecto
git clone <repo-url> && cd track

# Levantar todo (Postgres + Backend + Frontend)
docker-compose up --build

# Acceder a:
# - Frontend:    http://localhost:4200
# - Backend API: http://localhost:8080/api
# - Swagger UI:  http://localhost:8080/api/swagger-ui.html
```

### Opción 2: Desarrollo local

**Requisitos:** Java 17+, Node.js 20+, PostgreSQL 16+

```bash
# 1. Levantar solo PostgreSQL con Docker
docker run -d --name budget-db \
  -e POSTGRES_DB=budget_db \
  -e POSTGRES_USER=budget_user \
  -e POSTGRES_PASSWORD=budget_pass \
  -p 5432:5432 \
  postgres:16-alpine

# 2. Backend
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 3. Frontend (en otra terminal)
cd frontend
npm install
npm start
# Abre http://localhost:4200
```

## Ejecutar Tests

```bash
# Backend (JUnit 5 + Mockito)
cd backend
mvn test

# Frontend (Karma + Jasmine)
cd frontend
npm test              # modo watch
npm run test:ci       # modo CI (headless, una sola ejecución)
```

## API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/me` | Perfil del usuario |
| PATCH | `/api/users/me/settings` | Cambiar idioma/moneda |

### Presupuestos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/budgets` | Listar (paginado) |
| POST | `/api/budgets` | Crear |
| GET | `/api/budgets/{id}` | Detalle |
| PUT | `/api/budgets/{id}` | Actualizar |
| DELETE | `/api/budgets/{id}` | Eliminar (soft) |

### Transacciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/transactions` | Listar con filtros y paginación |
| POST | `/api/transactions` | Crear |
| GET | `/api/transactions/{id}` | Detalle |
| PUT | `/api/transactions/{id}` | Actualizar |
| DELETE | `/api/transactions/{id}` | Eliminar (soft) |
| GET | `/api/transactions/export/{budgetId}` | Exportar CSV |
| POST | `/api/transactions/import/{budgetId}` | Importar CSV |

### Categorías
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories` | Listar (usuario + default) |
| POST | `/api/categories` | Crear |
| PUT | `/api/categories/{id}` | Actualizar |
| DELETE | `/api/categories/{id}` | Eliminar |

### Reportes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reports/dashboard` | Métricas del dashboard |

## Ejemplos de Payloads JSON

### Crear presupuesto
```json
POST /api/budgets
{
  "name": "Febrero 2026",
  "totalAmount": 3500000,
  "period": "MONTHLY",
  "startDate": "2026-02-01",
  "endDate": "2026-02-28",
  "currency": "COP"
}
```

### Registrar gasto
```json
POST /api/transactions
{
  "description": "Mercado semanal",
  "amount": 285000,
  "type": "EXPENSE",
  "transactionDate": "2026-02-15",
  "budgetId": 1,
  "categoryId": 3,
  "notes": "Compras en almacén"
}
```

### Listar transacciones paginadas
```
GET /api/transactions?budgetId=1&type=EXPENSE&startDate=2026-02-01&endDate=2026-02-28&page=0&size=20&sort=transactionDate,desc
```

### Respuesta del dashboard
```json
GET /api/reports/dashboard?startDate=2026-02-01&endDate=2026-02-28
{
  "success": true,
  "data": {
    "totalIncome": 5000000,
    "totalExpenses": 3200000,
    "balance": 1800000,
    "monthlyAverageExpense": 3100000,
    "totalSavings": 1800000,
    "budgetUsagePercentage": 91.43,
    "categoryBreakdown": [
      { "categoryName": "Alimentación", "amount": 850000, "percentage": 26.56 },
      { "categoryName": "Vivienda", "amount": 1200000, "percentage": 37.50 },
      { "categoryName": "Transporte", "amount": 350000, "percentage": 10.94 }
    ],
    "budgetVsActual": [
      { "categoryName": "Febrero 2026", "budgeted": 3500000, "actual": 3200000 }
    ],
    "balanceHistory": [
      { "date": "2026-02-01", "balance": 5000000 },
      { "date": "2026-02-10", "balance": 3500000 },
      { "date": "2026-02-20", "balance": 1800000 }
    ],
    "fixedVsVariable": [
      { "month": "2025-09", "fixedExpenses": 1800000, "variableExpenses": 1200000 },
      { "month": "2025-10", "fixedExpenses": 1800000, "variableExpenses": 1400000 }
    ]
  }
}
```

## Cambiar Idioma y Moneda

### Desde la UI
1. Inicia sesión
2. Ve a **Configuración** en el menú lateral
3. Selecciona idioma (Español / English / Português)
4. Selecciona moneda (COP, USD, EUR, MXN, ARS, BRL)
5. Haz clic en "Guardar cambios"

### Desde la API
```bash
curl -X PATCH http://localhost:8080/api/users/me/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"preferredCurrency": "USD", "preferredLocale": "en"}'
```

### Configuración por defecto
Los valores por defecto se configuran en:
- **Backend:** `application.yml` → `app.default-locale: es`, `app.default-currency: COP`
- **Frontend:** `environment.ts` → `defaultLocale: 'es'`, `defaultCurrency: 'COP'`

## Gráficos del Dashboard

| Gráfico | Tipo | Descripción |
|---------|------|-------------|
| Distribución por categoría | Dona (Donut) | Porcentaje de gasto por categoría |
| Presupuesto vs. Gasto | Barras agrupadas | Comparación presupuestado vs real |
| Saldo en el tiempo | Línea/Área | Evolución del saldo durante el periodo |
| Fijos vs. Variables | Barras apiladas | Proporción de gastos fijos vs variables (6 meses) |
| KPIs | Tarjetas | Ingreso total, gasto total, saldo, promedio mensual, ahorro, % uso |

## Futuras Mejoras

- **Notificaciones push:** alertas en tiempo real cuando se acerque al límite del presupuesto
- **Sincronización bancaria:** integración con APIs bancarias (Open Banking) para importar transacciones automáticamente
- **OCR de recibos:** escanear facturas/recibos con la cámara y extraer datos automáticamente
- **Presupuestos compartidos:** para parejas o familias
- **Exportación PDF:** reportes mensuales en PDF
- **Modo offline:** PWA con sincronización al reconectar
- **Metas de ahorro:** definir objetivos y seguimiento visual
- **Gráficos personalizables:** permitir al usuario elegir qué gráficos mostrar en el dashboard
