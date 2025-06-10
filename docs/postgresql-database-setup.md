# PostgreSQL Database Setup - NestCraft

## 📋 **المهمة 3: تكوين PostgreSQL Database**

تم الانتهاء من إعداد PostgreSQL Database شامل مع TypeORM، connection pooling، migrations، و performance optimization.

---

## 🗄️ **Database Architecture**

### **Core Components**

- **TypeORM Integration**: ORM كامل مع PostgreSQL
- **Connection Pooling**: إدارة اتصالات محسنة
- **Migration System**: نظام ترحيل قاعدة البيانات
- **Base Entity**: Entity أساسي للتوريث
- **Health Monitoring**: مراقبة صحة قاعدة البيانات

---

## 📁 **File Structure**

```
libs/shared/src/
├── config/
│   └── database.config.ts          # Database configuration
├── database/
│   ├── database.module.ts          # Database module
│   ├── database.service.ts         # Database service
│   ├── connection-pool.service.ts  # Connection pool service
│   ├── migration.service.ts        # Migration service
│   ├── data-source.ts             # TypeORM DataSource
│   └── migrations/
│       └── 1700000000000-InitialSchema.ts
├── entities/
│   ├── base.entity.ts             # Base entity with audit fields
│   └── user.entity.ts             # User entity example
└── index.ts                       # Exports
```

---

## ⚙️ **Configuration**

### **Environment Variables**

```bash
# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nestcraft
DB_PASSWORD=nestcraft_dev_password
DB_DATABASE=nestcraft_dev
DB_SCHEMA=public

# Connection Pool
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_ACQUIRE=60000
DB_POOL_IDLE=10000
DB_POOL_EVICT=1000

# Performance
DB_CACHE_DURATION=30000
DB_MAX_QUERY_TIME=5000

# Redis for Caching
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB_CACHE=1
```

### **Database Config Features**

```typescript
// libs/shared/src/config/database.config.ts
- ✅ TypeORM Configuration
- ✅ Connection Pool Optimization
- ✅ SSL Support for Production
- ✅ Redis Query Caching
- ✅ Migration Configuration
- ✅ Health Check Settings
- ✅ Performance Monitoring
```

---

## 🏗️ **Database Entities**

### **Base Entity Features**

```typescript
// libs/shared/src/entities/base.entity.ts
export abstract class BaseEntity {
  // Primary Key
  id: UUID (Primary)

  // Audit Fields
  createdAt: timestamptz
  updatedAt: timestamptz
  deletedAt: timestamptz (Soft Delete)
  version: int (Optimistic Locking)

  // User Tracking
  createdBy?: string
  updatedBy?: string

  // Metadata
  metadata?: jsonb
  isActive: boolean

  // Virtual Properties
  isDeleted, isNew, isModified

  // Helper Methods
  softDelete(), restore(), markAsUpdated()
}
```

### **User Entity Features**

```typescript
// libs/shared/src/entities/user.entity.ts
export class User extends BaseEntity {
  // Identity
  email: string (unique)
  username: string (unique)
  password: string (hashed)

  // Profile
  firstName, lastName, phone, avatar, bio

  // Authorization
  role: UserRole (enum)
  status: UserStatus (enum)

  // Security
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  backupCodes?: string[]
  failedLoginAttempts: number
  lockedUntil?: Date

  // Tokens
  passwordResetToken?: string
  emailVerificationToken?: string

  // Tracking
  lastLoginAt?: Date
  lastLoginIp?: string
  emailVerifiedAt?: Date
}
```

---

## 🔄 **Migration System**

### **Available Commands**

```bash
# Run Migrations
npm run db:migrate

# Revert Last Migration
npm run db:migrate:revert

# Show Migration Status
npm run db:migrate:show

# Generate New Migration
npm run db:migrate:generate -- MigrationName

# Sync Schema (Development Only)
npm run db:schema:sync

# Drop Schema (Danger!)
npm run db:schema:drop
```

### **Initial Migration**

```sql
-- 1700000000000-InitialSchema.ts
- ✅ UUID Extension
- ✅ ENUM Types (user_role, user_status)
- ✅ nc_users Table with all fields
- ✅ Indexes for Performance
- ✅ Triggers for updated_at
- ✅ Default Super Admin User
```

---

## 🔌 **Connection Pool Management**

### **Pool Configuration**

```typescript
// Connection Pool Settings
{
  max: 20,           // Maximum connections
  min: 5,            // Minimum connections
  acquire: 60000,    // Max time to get connection (ms)
  idle: 10000,       // Max idle time (ms)
  evict: 1000        // Eviction check interval (ms)
}
```

### **Pool Monitoring**

```typescript
// ConnectionPoolService provides:
- Connection Statistics
- Pool Optimization
- Health Monitoring
- Idle Connection Cleanup
- Performance Recommendations
```

---

## 🔍 **Database Services**

### **DatabaseService Features**

```typescript
// Primary Database Operations
- Connection Validation
- Health Monitoring
- Statistics Collection
- Query Execution with Retry
- Transaction Management
- Database Optimization
- Backup Creation
```

### **Health Check Endpoints**

```typescript
// Health Information
{
  status: 'healthy' | 'unhealthy',
  responseTime: number,
  connectionCount: number,
  databaseSize: string,
  uptime: number,
  lastChecked: Date
}
```

---

## 📊 **Performance Features**

### **Query Optimization**

- **Query Caching**: Redis-based caching
- **Connection Pooling**: Optimized pool management
- **Index Strategy**: Strategic indexing for performance
- **Query Monitoring**: Slow query detection
- **Performance Stats**: Comprehensive monitoring

### **Monitoring Capabilities**

```typescript
// Database Statistics
{
  totalQueries: number,
  slowQueries: number,
  activeConnections: number,
  idleConnections: number,
  cacheHitRatio: number,
  databaseSize: string,
  tableCount: number,
  indexCount: number
}
```

---

## 🔒 **Security Features**

### **Data Protection**

- **Soft Delete**: DeleteDateColumn for data preservation
- **Audit Trail**: Complete audit logging
- **Optimistic Locking**: Version-based concurrency control
- **Field Encryption**: Password hashing
- **SQL Injection Protection**: Parameterized queries

### **User Security**

- **Account Locking**: Failed login protection
- **Password Reset**: Secure token-based reset
- **Email Verification**: Email verification system
- **Two-Factor Auth**: 2FA support ready
- **Session Management**: Login tracking

---

## 🚀 **Development Workflow**

### **1. Database Setup**

```bash
# Start PostgreSQL (Docker)
npm run docker:dev:up

# Run Migrations
npm run db:migrate

# Verify Setup
npm run db:migrate:show
```

### **2. Entity Development**

```typescript
// Create new entity extending BaseEntity
import { BaseEntity } from "@nestcraft/shared";

@Entity("nc_posts")
export class Post extends BaseEntity {
  @Column()
  title: string;

  @Column("text")
  content: string;
}
```

### **3. Migration Creation**

```bash
# Generate migration from entity changes
npm run db:migrate:generate -- AddPostEntity

# Review generated migration file
# Run migration
npm run db:migrate
```

---

## 🛠️ **Advanced Configuration**

### **Production Optimizations**

```typescript
// Production Settings
- SSL Connection
- Connection Pool Tuning
- Query Performance Monitoring
- Backup Automation
- Health Check Integration
- Error Monitoring
```

### **Scaling Configuration**

```typescript
// Horizontal Scaling Ready
- Read Replicas Support
- Connection Pool per Service
- Database Sharding Ready
- Caching Layer Integration
```

---

## 📈 **Monitoring & Debugging**

### **Health Endpoints**

```bash
# Database Health
GET /api/v1/health/database

# Connection Pool Stats
GET /api/v1/health/pool

# Migration Status
GET /api/v1/migrations/status
```

### **Performance Monitoring**

```bash
# View slow queries
SELECT query, mean_time FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;

# Check connection usage
SELECT count(*), state FROM pg_stat_activity
GROUP BY state;

# Database size monitoring
SELECT pg_size_pretty(pg_database_size(current_database()));
```

---

## 🧪 **Testing**

### **Database Testing**

```bash
# Test database connection
npm run test:db:connection

# Test migrations
npm run test:db:migrations

# Test entity operations
npm run test:db:entities
```

### **Performance Testing**

```bash
# Connection pool stress test
npm run test:db:pool

# Query performance test
npm run test:db:performance
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Connection Issues**

   ```bash
   # Check PostgreSQL status
   docker ps | grep postgres

   # Check environment variables
   env | grep DB_
   ```

2. **Migration Failures**

   ```bash
   # Check migration status
   npm run db:migrate:show

   # Revert problematic migration
   npm run db:migrate:revert
   ```

3. **Performance Issues**

   ```bash
   # Check slow queries
   npm run db:analyze

   # Optimize connection pool
   npm run db:optimize
   ```

---

## ✅ **Task 3 Completion Status**

| Feature                      | Status | Description                    |
| ---------------------------- | ------ | ------------------------------ |
| **Database Config**          | ✅     | Complete TypeORM configuration |
| **Connection Pooling**       | ✅     | Advanced pool management       |
| **Base Entity**              | ✅     | Audit fields & soft delete     |
| **User Entity**              | ✅     | Complete user management       |
| **Migration System**         | ✅     | Full migration support         |
| **Health Monitoring**        | ✅     | Database health checks         |
| **Performance Optimization** | ✅     | Query caching & monitoring     |
| **Security Features**        | ✅     | Data protection & validation   |
| **Development Tools**        | ✅     | CLI commands & utilities       |
| **Documentation**            | ✅     | Complete setup guide           |

---

## 🔄 **Next Steps**

- ✅ **Task 2**: Docker & Kubernetes ✓
- ✅ **Task 3**: PostgreSQL Database ✓
- 🔄 **Task 4**: NestJS Core Modules
- ⏳ **Task 5**: Authentication & Authorization

---

**تم الانتهاء من PostgreSQL Database setup بنجاح! 🎉**

قاعدة البيانات جاهزة للاستخدام مع جميع الميزات المطلوبة للتطوير والإنتاج.
