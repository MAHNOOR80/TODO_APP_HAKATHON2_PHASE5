# Phase 4: Helm-Based Kubernetes (Minikube) Deployment Guide

This guide provides step-by-step instructions for deploying the Todo Application to a local Kubernetes cluster using Minikube and Helm.

## Prerequisites

Ensure you have the following installed:
- Docker Desktop (or Docker Engine)
- Minikube
- kubectl
- Helm 3+
- Node.js 20+ (for local development)

### Verify Installation

```bash
# Check Docker
docker --version

# Check Minikube
minikube version

# Check kubectl
kubectl version --client

# Check Helm
helm version
```

---

## 1. Start Minikube

```bash
# Start Minikube with sufficient resources
minikube start --cpus=4 --memory=8192 --driver=docker

# Verify Minikube is running
minikube status

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server
```

---

## 2. Configure Docker to Use Minikube's Docker Daemon

This step is **critical** - it allows you to build images directly into Minikube's Docker registry.

### On Windows (PowerShell):
```powershell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

### On Windows (CMD):
```cmd
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env --shell cmd') DO @%i
```

### On Linux/macOS:
```bash
eval $(minikube docker-env)
```

**Note:** You must run this command in every new terminal session.

---

## 3. Build Docker Images

```bash
# Navigate to project root
cd C:\Users\Lenovo\Desktop\TODO_APP_PHASE4

# Build Backend Image
docker build -t todo-backend:latest -f backend/Dockerfile ./backend

# Build Frontend Image
docker build -t todo-frontend:latest -f frontend/Dockerfile ./frontend

# Verify images
docker images | grep todo
```

---

## 4. Deploy with Helm

### Install the Helm Chart

```bash
# Install the todo-app chart
helm install todo-app k8s/helm/todo-app --namespace todo-app --create-namespace

# Or with custom values
helm install todo-app k8s/helm/todo-app \
  --namespace todo-app \
  --create-namespace \
  --set backend.image.tag=v1.0.0 \
  --set frontend.image.tag=v1.0.0
```

### Upgrade an Existing Release

```bash
helm upgrade todo-app k8s/helm/todo-app --namespace todo-app
```

### Check Release Status

```bash
helm status todo-app --namespace todo-app
helm list --namespace todo-app
```

### Uninstall

```bash
helm uninstall todo-app --namespace todo-app
```

---

## 5. Verify Deployment

### Check Pod Status

```bash
kubectl get pods -n todo-app -w

# Expected output:
# NAME                                    READY   STATUS    RESTARTS   AGE
# todo-app-backend-xxxxxxxxxx-xxxxx       1/1     Running   0          1m
# todo-app-frontend-xxxxxxxxxx-xxxxx      1/1     Running   0          1m
# todo-app-postgres-0                     1/1     Running   0          1m
```

### Check Services

```bash
kubectl get services -n todo-app

# Expected output:
# NAME                  TYPE        CLUSTER-IP       PORT(S)    AGE
# todo-app-backend      ClusterIP   10.96.xxx.xxx    5006/TCP   1m
# todo-app-frontend     ClusterIP   10.96.xxx.xxx    80/TCP     1m
# todo-app-postgres     ClusterIP   10.96.xxx.xxx    5432/TCP   1m
```

### Check Ingress

```bash
kubectl get ingress -n todo-app
```

### View Pod Logs

```bash
kubectl logs -f deployment/todo-app-backend -n todo-app
kubectl logs -f deployment/todo-app-frontend -n todo-app
```

---

## 6. Access the Application

### Using Minikube Tunnel (Recommended for Ingress)

```bash
# In a separate terminal:
minikube tunnel

# Then access:
# http://localhost       (frontend)
# http://localhost/api   (backend API)
```

### Using Port Forwarding

```bash
kubectl port-forward service/todo-app-frontend 8080:80 -n todo-app
kubectl port-forward service/todo-app-backend 5006:5006 -n todo-app

# Access:
# Frontend: http://localhost:8080
# Backend API: http://localhost:5006
```

---

## 7. Test Backend Health

```bash
curl http://localhost:5006/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "todo-backend",
  "timestamp": "2026-01-30T..."
}
```

---

## 8. Automated Deployment

Use the provided deployment script:

```bash
# Linux/macOS
bash scripts/phase4_deploy.sh

# Windows (Git Bash)
bash scripts/phase4_deploy.sh
```

---

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Start Minikube | `minikube start --cpus=4 --memory=8192` |
| Configure Docker | `eval $(minikube docker-env)` |
| Build Backend | `docker build -t todo-backend:latest -f backend/Dockerfile ./backend` |
| Build Frontend | `docker build -t todo-frontend:latest -f frontend/Dockerfile ./frontend` |
| Install Helm Chart | `helm install todo-app k8s/helm/todo-app -n todo-app --create-namespace` |
| Upgrade Release | `helm upgrade todo-app k8s/helm/todo-app -n todo-app` |
| Check Pods | `kubectl get pods -n todo-app` |
| View Logs | `kubectl logs -f deployment/todo-app-backend -n todo-app` |
| Access App | `minikube tunnel` |
| Port Forward | `kubectl port-forward svc/todo-app-frontend 8080:80 -n todo-app` |
| Uninstall | `helm uninstall todo-app -n todo-app` |
| Stop Minikube | `minikube stop` |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Namespace: todo-app                    │ │
│  │                                                          │ │
│  │  ┌──────────────┐    ┌──────────────┐                   │ │
│  │  │   Ingress    │───▶│   Frontend   │                   │ │
│  │  │   (nginx)    │    │   (Vite)     │                   │ │
│  │  └──────────────┘    └──────────────┘                   │ │
│  │         │                                                │ │
│  │         │            ┌──────────────┐                   │ │
│  │         └───────────▶│   Backend    │                   │ │
│  │                      │  (Express)   │                   │ │
│  │                      └──────┬───────┘                   │ │
│  │                             │                            │ │
│  │                             ▼                            │ │
│  │                      ┌──────────────┐                   │ │
│  │                      │  PostgreSQL  │                   │ │
│  │                      │ (StatefulSet)│                   │ │
│  │                      └──────────────┘                   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Service Communication

- **Frontend → Backend**: Via Ingress path routing (`/api` -> backend:5006)
- **Backend → Postgres**: Internal service DNS `todo-app-postgres:5432`
- **External → App**: Via Ingress or `minikube tunnel`

---

# Phase 5: DOKS (DigitalOcean Kubernetes) Deployment Guide

Deploy the Todo Application to a production DigitalOcean Kubernetes cluster with Dapr sidecars, Kafka event streaming, and reactive AI agents.

For the complete step-by-step guide, see: `specs/008-phase5-advanced-cloud-deployment/quickstart-doks.md`

## Prerequisites

- `doctl` CLI (authenticated with DigitalOcean API token)
- `kubectl`
- `helm` 3+
- `dapr` CLI
- Docker
- DigitalOcean Container Registry (DOCR) or Docker Hub
- DigitalOcean Managed Kafka cluster

## Quick Setup

### 1. Provision DOKS Cluster

```bash
doctl kubernetes cluster create todo-doks \
  --node-pool "name=default;size=s-2vcpu-4gb;count=3"
doctl kubernetes cluster kubeconfig save todo-doks
```

### 2. Install Dapr

```bash
dapr init -k --runtime-version 1.13.0
dapr status -k
```

### 3. Install NGINX Ingress Controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

### 4. Create Namespace and Secrets

```bash
kubectl create namespace todo-app

kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=AUTH_SECRET='your-secret' \
  --from-literal=OPENAI_API_KEY='sk-...' \
  -n todo-app

kubectl create secret generic kafka-creds \
  --from-literal=username='kafka-user' \
  --from-literal=password='kafka-password' \
  --from-literal=brokers='broker1:9093,broker2:9093' \
  -n todo-app
```

### 5. Apply Dapr Components

```bash
kubectl apply -f k8s/dapr/pubsub-kafka.yaml -n todo-app
kubectl apply -f k8s/dapr/resiliency.yaml -n todo-app
```

### 6. Build and Push Docker Images

```bash
docker build -t <registry>/todo-backend:v2.0.0 ./backend
docker build -t <registry>/todo-frontend:v2.0.0 ./frontend
docker build -t <registry>/todo-ai-agent:v2.0.0 ./ai-agent
docker push <registry>/todo-backend:v2.0.0
docker push <registry>/todo-frontend:v2.0.0
docker push <registry>/todo-ai-agent:v2.0.0
```

### 7. Deploy via Helm

```bash
helm upgrade --install todo-app ./k8s/helm/todo-app \
  -f k8s/helm/todo-app/values-doks.yaml \
  -n todo-app
```

### 8. Verify Deployment

```bash
kubectl get pods -n todo-app          # All pods Running with 2/2 containers
kubectl get ingress -n todo-app       # Public IP assigned
kubectl get svc -n ingress-nginx      # External IP for ingress
curl http://<ingress-ip>/health       # 200 OK
```

### 9. Verify Event Flow

```bash
# Check backend event publishing
kubectl logs deployment/todo-app-backend -c backend -n todo-app --tail=20

# Check Dapr sidecar pub/sub activity
kubectl logs deployment/todo-app-backend -c daprd -n todo-app --tail=20

# Check ai-agent event processing
kubectl logs deployment/todo-app-ai-agent -c ai-agent -n todo-app --tail=20
```

## Phase 5 Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    DOKS Cluster (3 nodes)                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   Namespace: todo-app                       │  │
│  │                                                             │  │
│  │  ┌──────────────┐    ┌─────────────────────────────────┐   │  │
│  │  │   Ingress    │───▶│  Frontend (2 replicas)          │   │  │
│  │  │   (NGINX)    │    └─────────────────────────────────┘   │  │
│  │  └──────┬───────┘                                          │  │
│  │         │            ┌─────────────────────────────────┐   │  │
│  │         └───────────▶│  Backend (2 replicas + HPA)     │   │  │
│  │                      │  + Dapr Sidecar                 │   │  │
│  │                      └──────────┬──────────────────────┘   │  │
│  │                                 │                           │  │
│  │              ┌──────────────────┼──────────────────┐       │  │
│  │              │                  │                   │       │  │
│  │              ▼                  ▼                   ▼       │  │
│  │     ┌──────────────┐  ┌──────────────┐   ┌──────────────┐ │  │
│  │     │ Neon Postgres│  │ DO Managed   │   │  AI Agent    │ │  │
│  │     │  (External)  │  │    Kafka     │   │ + Dapr Side  │ │  │
│  │     └──────────────┘  └──────────────┘   └──────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## DOKS Quick Reference

| Action | Command |
|--------|---------|
| Create Cluster | `doctl kubernetes cluster create todo-doks --node-pool "name=default;size=s-2vcpu-4gb;count=3"` |
| Install Dapr | `dapr init -k --runtime-version 1.13.0` |
| Helm Deploy | `helm upgrade --install todo-app ./k8s/helm/todo-app -f k8s/helm/todo-app/values-doks.yaml -n todo-app` |
| Check Pods | `kubectl get pods -n todo-app` |
| Backend Logs | `kubectl logs deployment/todo-app-backend -c backend -n todo-app` |
| Dapr Logs | `kubectl logs deployment/todo-app-backend -c daprd -n todo-app` |
| AI Agent Logs | `kubectl logs deployment/todo-app-ai-agent -c ai-agent -n todo-app` |
| Helm Lint | `helm lint k8s/helm/todo-app` |
| Helm Template | `helm template todo-app k8s/helm/todo-app -f k8s/helm/todo-app/values-doks.yaml` |
