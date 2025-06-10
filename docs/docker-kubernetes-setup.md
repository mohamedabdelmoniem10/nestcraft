# 🐳 NestCraft Docker & Kubernetes Setup

هذا الدليل يوضح كيفية تشغيل NestCraft باستخدام Docker و Kubernetes للتطوير والإنتاج.

## 📋 المتطلبات

### للتطوير المحلي

- Docker 20.x+
- Docker Compose 2.x+
- Node.js 18+
- npm 8+

### للإنتاج مع Kubernetes

- Kubernetes 1.24+
- kubectl CLI
- Helm 3.x (اختياري)
- nginx-ingress-controller
- cert-manager (للـ SSL certificates)

## 🐳 Docker Setup

### بنية الملفات

```
infra/
├── docker/
│   ├── backend.Dockerfile      # Backend NestJS container
│   ├── frontend.Dockerfile     # Frontend Next.js container
│   └── legacy.Dockerfile       # Legacy container (إذا وُجد)
├── docker-compose.yml          # التطوير المحلي
├── docker-compose.prod.yml     # الإنتاج
└── k8s/                        # Kubernetes manifests
```

### 🚀 تشغيل التطوير المحلي

```bash
# 1. بناء جميع الـ containers
npm run docker:build

# 2. تشغيل جميع الخدمات
npm run docker:up

# 3. مراقبة الـ logs
npm run docker:logs

# 4. إيقاف الخدمات
npm run docker:down

# 5. تنظيف شامل (حذف volumes)
npm run docker:clean
```

### 🌐 الخدمات المتاحة

| الخدمة          | URL                   | الوصف       |
| --------------- | --------------------- | ----------- |
| Frontend        | http://localhost:3000 | Next.js App |
| Backend API     | http://localhost:4000 | NestJS API  |
| PostgreSQL      | localhost:5432        | Database    |
| Redis           | localhost:6379        | Cache       |
| pgAdmin         | http://localhost:8080 | Database UI |
| Redis Commander | http://localhost:8081 | Redis UI    |

### 🔧 Environment Variables

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=nestcraft
DB_PASSWORD=nestcraft_dev_password
DB_DATABASE=nestcraft_dev

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=nestcraft_redis_password

# JWT
JWT_SECRET=nestcraft_dev_jwt_secret_2024
```

## ☸️ Kubernetes Setup

### بنية K8s Manifests

```
infra/k8s/
├── namespace.yaml          # Namespace تعريف
├── configmap.yaml          # Configuration بيانات
├── secrets.yaml            # Sensitive data
├── postgres.yaml           # PostgreSQL StatefulSet
├── redis.yaml              # Redis Deployment
├── backend.yaml            # Backend Deployment + HPA
├── frontend.yaml           # Frontend Deployment + HPA
└── ingress.yaml            # External access
```

### 🎯 نشر على Kubernetes

```bash
# 1. إنشاء namespace
kubectl apply -f infra/k8s/namespace.yaml

# 2. تطبيق جميع الـ manifests
npm run k8s:apply

# 3. التحقق من الحالة
npm run k8s:status

# 4. مراقبة logs
npm run k8s:logs:backend
npm run k8s:logs:frontend

# 5. حذف جميع الموارد
npm run k8s:delete
```

### 🔍 مراقبة الخدمات

```bash
# عرض جميع الموارد
kubectl get all -n nestcraft

# عرض تفاصيل المشاكل
kubectl describe pods -n nestcraft

# مراقبة events
kubectl get events -n nestcraft --sort-by='.lastTimestamp'

# اختبار الاتصال الداخلي
kubectl exec -it deployment/nestcraft-backend -n nestcraft -- curl http://postgres-service:5432
```

## 🏭 الإنتاج Production

### Docker Compose Production

```bash
# بناء للإنتاج
npm run docker:prod:build

# تشغيل الإنتاج
npm run docker:prod:up

# مراقبة الإنتاج
docker-compose -f infra/docker-compose.prod.yml logs -f

# إيقاف الإنتاج
npm run docker:prod:down
```

### Kubernetes Production Features

#### 🔄 Auto Scaling (HPA)

- **Backend**: 2-10 pods based on CPU/Memory
- **Frontend**: 2-8 pods based on CPU/Memory
- **Metrics**: 70% CPU, 80% Memory thresholds

#### 🗂️ Storage Classes

- **fast-ssd**: للـ databases (PostgreSQL, Redis)
- **nfs-storage**: للـ shared files (uploads, logs)

#### 🔒 Security Features

- **Secrets**: Encrypted sensitive data
- **RBAC**: Role-based access control
- **Network Policies**: Traffic isolation
- **Pod Security**: Non-root containers

#### 🌐 Ingress Configuration

- **SSL/TLS**: Automatic certificates with cert-manager
- **Rate Limiting**: 100 requests per minute
- **CORS**: Configured for all environments
- **Compression**: gzip enabled

## 🛠️ Development Workflow

### 1. Local Development با Docker

```bash
# Start development environment
npm run docker:up

# Watch logs
npm run docker:logs

# Build and restart specific service
docker-compose -f infra/docker-compose.yml up -d --build backend

# Access database
docker exec -it nestcraft-postgres-1 psql -U nestcraft -d nestcraft_dev

# Access Redis
docker exec -it nestcraft-redis-1 redis-cli -a nestcraft_redis_password
```

### 2. Testing في Kubernetes

```bash
# Deploy to local K8s (minikube/kind)
npm run k8s:apply

# Port forwarding للـ testing
kubectl port-forward svc/nestcraft-backend-service 4000:4000 -n nestcraft
kubectl port-forward svc/nestcraft-frontend-service 3000:3000 -n nestcraft

# Database access
kubectl port-forward svc/postgres-service 5432:5432 -n nestcraft
```

## 🐛 استكشاف الأخطاء Troubleshooting

### Docker Issues

```bash
# Check container status
docker ps -a

# View container logs
docker logs nestcraft-backend-1 -f

# Access container shell
docker exec -it nestcraft-backend-1 /bin/sh

# Rebuild without cache
docker-compose -f infra/docker-compose.yml build --no-cache

# Check networks
docker network ls
docker network inspect nestcraft_nestcraft-network
```

### Kubernetes Issues

```bash
# Pod stuck in Pending
kubectl describe pod <pod-name> -n nestcraft

# Check resource usage
kubectl top pods -n nestcraft
kubectl top nodes

# Check persistent volumes
kubectl get pv,pvc -n nestcraft

# Network connectivity
kubectl exec -it <pod-name> -n nestcraft -- nslookup postgres-service
```

### Performance Optimization

#### Docker

- Multi-stage builds للحد من حجم الصور
- `.dockerignore` شامل
- Layer caching optimization
- Health checks للـ reliability

#### Kubernetes

- Resource requests/limits محددة بدقة
- Horizontal Pod Autoscaling
- Persistent Volume Claims للـ data
- Liveness/Readiness probes

## 🔧 Configuration Files

### Docker Compose Override

للتطوير المحلي، يمكنك إنشاء `docker-compose.override.yml`:

```yaml
version: "3.8"
services:
  backend:
    volumes:
      - ../apps/backend:/app/apps/backend
    environment:
      - NODE_ENV=development
      - DEBUG=nestcraft:*

  frontend:
    volumes:
      - ../apps/frontend:/app/apps/frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Kubernetes Kustomization

لتخصيص البيئات المختلفة:

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - namespace.yaml
  - configmap.yaml
  - secrets.yaml
  - postgres.yaml
  - redis.yaml
  - backend.yaml
  - frontend.yaml
  - ingress.yaml

patchesStrategicMerge:
  - backend-patch.yaml
  - frontend-patch.yaml
```

## 📊 Monitoring & Logging

### Available Endpoints

- **Health Check**: `/api/v1/health`
- **Metrics**: `/api/v1/metrics` (Prometheus format)
- **Documentation**: `/api/v1/docs` (Swagger)

### Log Aggregation

- **Development**: Docker Compose logs
- **Production**: Fluentd → Elasticsearch → Kibana
- **Kubernetes**: kubectl logs + Monitoring stack

## 🚀 Next Steps

بعد إتمام هذه المهمة، يمكنك:

1. **إعداد CI/CD Pipeline**: GitHub Actions / GitLab CI
2. **Monitoring Stack**: Prometheus + Grafana
3. **Security Scanning**: Trivy, Snyk للـ containers
4. **Service Mesh**: Istio للـ advanced networking
5. **GitOps**: ArgoCD للـ deployment automation

---

## 📚 المراجع

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nx Docker Builders](https://nx.dev/recipes/node/docker-build)
- [Next.js Docker](https://nextjs.org/docs/deployment)
- [NestJS Docker](https://docs.nestjs.com/recipes/dockerfile)
