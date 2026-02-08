# cloud-native-deployment

Deploy AI-powered applications using Docker, Kubernetes, Helm, Kafka, and Dapr

## Components

### 1. Dockerfile & Multi-Stage Build Templates

#### Node.js/TypeScript Backend
```dockerfile
# Multi-stage build for Node.js backend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

#### Python FastAPI Backend
```dockerfile
# Multi-stage build for Python FastAPI
FROM python:3.11-slim AS builder

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1001 -s /bin/bash appuser

WORKDIR /app

COPY --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appuser . .

USER appuser
ENV PATH=/home/appuser/.local/bin:$PATH

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### React/Vite Frontend
```dockerfile
# Multi-stage build for React frontend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf for React SPA
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 2. Helm Chart Scaffolding

#### Chart.yaml
```yaml
apiVersion: v2
name: todo-app
description: AI-powered Todo Application
type: application
version: 1.0.0
appVersion: "1.0.0"
```

#### values.yaml
```yaml
global:
  environment: production
  domain: todo-app.example.com

backend:
  replicaCount: 3
  image:
    repository: your-registry/todo-backend
    tag: "1.0.0"
    pullPolicy: IfNotPresent

  service:
    type: ClusterIP
    port: 8000

  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi

  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70

  env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: todo-secrets
          key: database-url
    - name: KAFKA_BROKERS
      value: "todo-kafka:9092"

  livenessProbe:
    httpGet:
      path: /health
      port: 8000
    initialDelaySeconds: 30
    periodSeconds: 10

  readinessProbe:
    httpGet:
      path: /ready
      port: 8000
    initialDelaySeconds: 5
    periodSeconds: 5

frontend:
  replicaCount: 2
  image:
    repository: your-registry/todo-frontend
    tag: "1.0.0"
    pullPolicy: IfNotPresent

  service:
    type: ClusterIP
    port: 80

  resources:
    requests:
      cpu: 50m
      memory: 128Mi
    limits:
      cpu: 200m
      memory: 256Mi

postgresql:
  enabled: true
  auth:
    username: todouser
    database: tododb
    existingSecret: todo-secrets

  persistence:
    enabled: true
    size: 10Gi

redis:
  enabled: true
  architecture: standalone
  auth:
    enabled: false

kafka:
  enabled: true
  replicaCount: 3
  persistence:
    enabled: true
    size: 10Gi

dapr:
  enabled: true
  sidecar:
    image: "daprio/daprd:1.12.0"
    appPort: 8000
    logLevel: "info"

  components:
    - name: statestore
      type: state.redis
      version: v1
      metadata:
        - name: redisHost
          value: "todo-redis:6379"

    - name: pubsub
      type: pubsub.kafka
      version: v1
      metadata:
        - name: brokers
          value: "todo-kafka:9092"

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod

  hosts:
    - host: todo-app.example.com
      paths:
        - path: /api
          backend:
            service:
              name: todo-backend
              port: 8000
        - path: /
          backend:
            service:
              name: todo-frontend
              port: 80

  tls:
    - secretName: todo-tls
      hosts:
        - todo-app.example.com
```

#### templates/backend-deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "todo-app.fullname" . }}-backend
  labels:
    {{- include "todo-app.labels" . | nindent 4 }}
    app.kubernetes.io/component: backend
spec:
  {{- if not .Values.backend.autoscaling.enabled }}
  replicas: {{ .Values.backend.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "todo-app.selectorLabels" . | nindent 6 }}
      app.kubernetes.io/component: backend
  template:
    metadata:
      annotations:
        {{- if .Values.dapr.enabled }}
        dapr.io/enabled: "true"
        dapr.io/app-id: "todo-backend"
        dapr.io/app-port: "{{ .Values.dapr.sidecar.appPort }}"
        {{- end }}
      labels:
        {{- include "todo-app.selectorLabels" . | nindent 8 }}
        app.kubernetes.io/component: backend
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
      containers:
        - name: backend
          image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
          imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.backend.service.port }}
          env:
            {{- toYaml .Values.backend.env | nindent 12 }}
          livenessProbe:
            {{- toYaml .Values.backend.livenessProbe | nindent 12 }}
          readinessProbe:
            {{- toYaml .Values.backend.readinessProbe | nindent 12 }}
          resources:
            {{- toYaml .Values.backend.resources | nindent 12 }}
          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
```

### 3. Kafka/Dapr Pub-Sub Configuration

#### Dapr Component: Kafka PubSub
```yaml
# components/pubsub-kafka.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: task-events
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "todo-kafka:9092"
    - name: consumerGroup
      value: "todo-app-group"
    - name: enableIdempotence
      value: "true"
```

#### Publishing Events with Dapr
```typescript
import { DaprClient } from '@dapr/dapr';

const client = new DaprClient({
  daprHost: process.env.DAPR_HOST || '127.0.0.1',
  daprPort: process.env.DAPR_HTTP_PORT || '3500',
});

export class EventService {
  private readonly pubsubName = 'task-events';

  async publishTaskCreated(task: Task): Promise<void> {
    await client.pubsub.publish(this.pubsubName, 'task.created', {
      taskId: task.id,
      userId: task.userId,
      title: task.title,
      createdAt: task.createdAt.toISOString(),
    });
  }

  async publishTaskCompleted(taskId: number, userId: number): Promise<void> {
    await client.pubsub.publish(this.pubsubName, 'task.completed', {
      taskId,
      userId,
      completedAt: new Date().toISOString(),
    });
  }
}
```

#### Subscribing to Events
```typescript
import { DaprServer } from '@dapr/dapr';

const server = new DaprServer({
  serverHost: '0.0.0.0',
  serverPort: process.env.DAPR_APP_PORT || '8000'
});

await server.pubsub.subscribe('task-events', 'task.created', async (data: any) => {
  console.log('Task created:', data);
  await analyticsService.trackTaskCreation(data);
});

await server.pubsub.subscribe('task-events', 'task.completed', async (data: any) => {
  console.log('Task completed:', data);
  await userService.incrementCompletedTasks(data.userId);
});

await server.start();
```

### 4. Minikube & Cloud Deployment Flows

#### Local Development with Minikube
```bash
#!/bin/bash
# scripts/deploy-local.sh

# Start Minikube
minikube start --cpus=4 --memory=8192 --disk-size=20g

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# Install Dapr
dapr init --kubernetes --wait

# Create namespace
kubectl create namespace todo-app

# Create secrets
kubectl create secret generic todo-secrets \
  --from-literal=database-url="postgresql://user:pass@postgres:5432/tododb" \
  -n todo-app

# Build images locally
eval $(minikube docker-env)
docker build -t todo-backend:dev ./backend
docker build -t todo-frontend:dev ./frontend

# Install Helm chart
helm install todo-app ./helm/todo-app \
  --namespace todo-app \
  --set backend.image.repository=todo-backend \
  --set backend.image.tag=dev \
  --set frontend.image.repository=todo-frontend \
  --set frontend.image.tag=dev

# Port forward
kubectl port-forward service/todo-app-frontend 8080:80 -n todo-app &
kubectl port-forward service/todo-app-backend 8000:8000 -n todo-app &

echo "Frontend: http://localhost:8080"
echo "Backend: http://localhost:8000"
```

#### DigitalOcean Kubernetes (DOKS)
```bash
#!/bin/bash
# scripts/deploy-doks.sh

# Create cluster
doctl kubernetes cluster create todo-prod \
  --region nyc1 \
  --node-pool "name=workers;size=s-2vcpu-4gb;count=3;auto-scale=true;min-nodes=3;max-nodes=10"

# Get kubeconfig
doctl kubernetes cluster kubeconfig save todo-prod

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Install nginx ingress
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx

# Install Dapr
dapr init --kubernetes --wait

# Create secrets
kubectl create secret generic todo-secrets \
  --from-literal=database-url="$DATABASE_URL" \
  -n production

# Deploy application
helm install todo-app ./helm/todo-app \
  --namespace production \
  --set backend.image.tag=$IMAGE_TAG \
  --set frontend.image.tag=$IMAGE_TAG
```

#### Google Kubernetes Engine (GKE)
```bash
#!/bin/bash
# scripts/deploy-gke.sh

PROJECT_ID="my-project"
REGION="us-central1"
CLUSTER_NAME="todo-prod"

# Create GKE cluster
gcloud container clusters create-auto $CLUSTER_NAME \
  --region=$REGION \
  --project=$PROJECT_ID

# Get credentials
gcloud container clusters get-credentials $CLUSTER_NAME --region=$REGION

# Install components
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
dapr init --kubernetes --wait

# Deploy application
helm install todo-app ./helm/todo-app \
  --namespace production \
  --values ./helm/values-gke.yaml
```

#### Azure Kubernetes Service (AKS)
```bash
#!/bin/bash
# scripts/deploy-aks.sh

RESOURCE_GROUP="todo-rg"
CLUSTER_NAME="todo-prod"

# Create cluster
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $CLUSTER_NAME \
  --node-count 3 \
  --enable-addons monitoring

# Get credentials
az aks get-credentials --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME

# Install components
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
dapr init --kubernetes --wait

# Deploy application
helm install todo-app ./helm/todo-app \
  --namespace production \
  --values ./helm/values-aks.yaml
```

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Log in to registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ env.REGISTRY }}/todo-backend:${{ github.sha }}

      - name: Build frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: ${{ env.REGISTRY }}/todo-frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Kubernetes
        run: |
          helm upgrade --install todo-app ./helm/todo-app \
            --namespace production \
            --set backend.image.tag=${{ github.sha }} \
            --set frontend.image.tag=${{ github.sha }}
```

## Best Practices Checklist

- [ ] Multi-stage builds for minimal image size
- [ ] Non-root user in containers
- [ ] Health checks (liveness + readiness)
- [ ] Resource limits defined
- [ ] Horizontal Pod Autoscaling enabled
- [ ] Secrets in Kubernetes Secrets/external vaults
- [ ] TLS via cert-manager
- [ ] Ingress with rate limiting
- [ ] Monitoring with Prometheus
- [ ] Dapr for state/pubsub abstraction
- [ ] Database backups automated
- [ ] CI/CD with automated deployment

## Anti-Patterns to Avoid

❌ Running as root
❌ No resource limits
❌ Missing health checks
❌ Secrets in code
❌ Single replica for critical services
❌ Using `latest` tag in production
❌ No rollback strategy
❌ Hardcoded configuration
