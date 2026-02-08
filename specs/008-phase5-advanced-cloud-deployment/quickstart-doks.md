# DOKS Deployment Quickstart Guide

**Feature**: Phase V - Advanced Cloud-Native Event-Driven Deployment
**Target**: DigitalOcean Kubernetes (DOKS) with Dapr sidecars and Kafka pub/sub

---

## Prerequisites

- [doctl](https://docs.digitalocean.com/reference/doctl/) CLI installed and authenticated
- [kubectl](https://kubernetes.io/docs/tasks/tools/) CLI installed
- [helm](https://helm.sh/docs/intro/install/) v3+ installed
- [dapr](https://docs.dapr.io/getting-started/install-dapr-cli/) CLI installed
- [Docker](https://docs.docker.com/get-docker/) installed and running
- DigitalOcean account with:
  - Container Registry (DOCR) created
  - Managed Kafka cluster provisioned (SASL/SCRAM + TLS)
  - Neon PostgreSQL database provisioned (external)

---

## Step 1: Provision DOKS Cluster

```bash
# Create a 3-node DOKS cluster
doctl kubernetes cluster create todo-doks \
  --node-pool "name=default;size=s-2vcpu-4gb;count=3"

# Save kubeconfig
doctl kubernetes cluster kubeconfig save todo-doks

# Verify access
kubectl cluster-info
kubectl get nodes
```

---

## Step 2: Install Dapr on Cluster

```bash
# Install Dapr runtime (v1.13+)
dapr init -k --runtime-version 1.13.0

# Verify Dapr is running
dapr status -k
```

Expected output: `dapr-operator`, `dapr-sentry`, `dapr-sidecar-injector`, `dapr-placement-server` all Running.

---

## Step 3: Install NGINX Ingress Controller

```bash
# Add NGINX Ingress Helm repo
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install NGINX Ingress Controller
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Wait for external IP assignment
kubectl get svc -n ingress-nginx -w
```

Note the `EXTERNAL-IP` from the `nginx-ingress-ingress-nginx-controller` service. This is your public ingress IP.

---

## Step 4: Build and Push Docker Images

```bash
# Login to DigitalOcean Container Registry
doctl registry login

# Set your registry (replace <registry> with your DOCR name)
export REGISTRY=registry.digitalocean.com/<registry>

# Build images
docker build -t $REGISTRY/todo-backend:v2.0.0 ./backend
docker build -t $REGISTRY/todo-frontend:v2.0.0 --build-arg VITE_API_URL=/api/v1 ./frontend
docker build -t $REGISTRY/todo-ai-agent:v2.0.0 ./ai-agent

# Push images
docker push $REGISTRY/todo-backend:v2.0.0
docker push $REGISTRY/todo-frontend:v2.0.0
docker push $REGISTRY/todo-ai-agent:v2.0.0
```

---

## Step 5: Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace todo-app

# Create application secrets
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@host:5432/db?sslmode=require' \
  --from-literal=AUTH_SECRET='your-auth-secret-here' \
  --from-literal=OPENAI_API_KEY='sk-your-key-here' \
  -n todo-app

# Create Kafka credentials
kubectl create secret generic kafka-creds \
  --from-literal=username='kafka-sasl-username' \
  --from-literal=password='kafka-sasl-password' \
  --from-literal=brokers='broker1:9093,broker2:9093' \
  -n todo-app
```

---

## Step 6: Apply Dapr Components

```bash
# Apply Kafka pub/sub component
kubectl apply -f k8s/dapr/pubsub-kafka.yaml -n todo-app

# Apply resiliency policy
kubectl apply -f k8s/dapr/resiliency.yaml -n todo-app

# Verify components
dapr components -k -n todo-app
```

---

## Step 7: Update Helm Values

Before deploying, update `k8s/helm/todo-app/values-doks.yaml`:

1. Replace `<registry>` with your actual DOCR registry name in all image repository fields
2. Set image tags to `v2.0.0` (or your current version)
3. Optionally set `ingress.hosts[0].host` to your DNS name

---

## Step 8: Deploy with Helm

```bash
# Deploy (or upgrade) the application
helm upgrade --install todo-app ./k8s/helm/todo-app \
  -f k8s/helm/todo-app/values-doks.yaml \
  -n todo-app

# Check deployment status
helm status todo-app -n todo-app
```

---

## Step 9: Verify Deployment

```bash
# Check all pods are Running (2/2 containers = app + daprd sidecar)
kubectl get pods -n todo-app

# Check services
kubectl get svc -n todo-app

# Check ingress and get public IP
kubectl get ingress -n todo-app

# Test health endpoint
curl http://<INGRESS-IP>/health

# Verify Dapr sidecars are injected
kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{" containers: "}{range .spec.containers[*]}{.name}{" "}{end}{"\n"}{end}'
```

Expected: backend and ai-agent pods show 2 containers (application + daprd).

---

## Step 10: Smoke Test

1. Navigate to `http://<INGRESS-IP>` in a browser
2. Sign up a new user account
3. Sign in with the new account
4. Create a task via the UI
5. Open the AI chatbot and say: "Create a task called Review PR with high priority"
6. Verify both tasks appear in the task list
7. Verify the AI chatbot responds correctly
8. Check the Suggestions panel loads

---

## Troubleshooting

### Pods not starting
```bash
# Check pod events
kubectl describe pod <pod-name> -n todo-app

# Check pod logs
kubectl logs <pod-name> -c backend -n todo-app
kubectl logs <pod-name> -c daprd -n todo-app
```

### Dapr sidecar not injecting
```bash
# Verify Dapr is installed
dapr status -k

# Check pod annotations include dapr.io/enabled: "true"
kubectl get pod <pod-name> -n todo-app -o yaml | grep dapr
```

### Ingress not routing
```bash
# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Verify ingress rules
kubectl describe ingress todo-app-ingress -n todo-app
```

### Database connection issues
```bash
# Verify secret exists
kubectl get secret todo-app-secrets -n todo-app

# Test from inside a pod
kubectl exec -it <backend-pod> -c backend -n todo-app -- printenv DATABASE_URL
```

---

## Upgrade / Redeploy

```bash
# Rebuild and push updated images
docker build -t $REGISTRY/todo-backend:v2.1.0 ./backend
docker push $REGISTRY/todo-backend:v2.1.0

# Update image tag in values-doks.yaml, then:
helm upgrade todo-app ./k8s/helm/todo-app \
  -f k8s/helm/todo-app/values-doks.yaml \
  -n todo-app

# Monitor rollout
kubectl rollout status deployment/todo-app-backend -n todo-app
```

---

## Teardown

```bash
# Remove application
helm uninstall todo-app -n todo-app

# Remove Dapr components
kubectl delete -f k8s/dapr/ -n todo-app

# Remove namespace
kubectl delete namespace todo-app

# Remove Dapr from cluster
dapr uninstall -k

# Delete DOKS cluster (if no longer needed)
doctl kubernetes cluster delete todo-doks
```
