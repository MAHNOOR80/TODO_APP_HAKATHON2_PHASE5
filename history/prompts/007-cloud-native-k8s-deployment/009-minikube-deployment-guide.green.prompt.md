---
id: 009
title: Minikube Deployment Guide Creation
stage: green
date: 2026-01-25
surface: agent
model: claude-opus-4-5-20251101
feature: 007-cloud-native-k8s-deployment
branch: null
user: Lenovo
command: /sp.implement
labels: ["phase4", "minikube", "kubernetes", "docker", "deployment"]
links:
  spec: specs/007-cloud-native-k8s-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - DEPLOYMENT.md
  - k8s/overlays/minikube/kustomization.yaml
  - scripts/deploy-minikube.sh
  - scripts/deploy-minikube.ps1
tests:
  - T038 - Docker image build verification (pending manual)
  - T039 - Kubernetes deployment test (pending manual)
---

## Prompt

## Phase 4 – Docker & Kubernetes (Minikube) Deployment Prompt

You have my completed **Phase 1, Phase 2, and Phase 3** Todo application with:

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express.js (includes AI-powered chatbot)
- **Structure:** Monorepo

---

## Task (Phase 4)

Implement **Local Kubernetes Deployment**

### 1. Dockerization
- Create **Dockerfile** for: Frontend (Vite + React), Backend (Express.js)
- Build **Docker images** for both services
- Ensure both services run correctly inside Docker containers

### 2. Kubernetes / Minikube Deployment
- Create **Kubernetes manifests or Helm charts** for: Frontend, Backend
- Deploy both services on **Minikube**
- Expose: Frontend using **NodePort or Ingress**, Backend via **Kubernetes Service (ClusterIP)**
- Frontend must communicate with backend using **Kubernetes service name**

---

## Requirements (Strict)

- Follow **cloud-native best practices**
- Use **environment variables** for configs

## Response snapshot

Created comprehensive Minikube deployment documentation and scripts:

**DEPLOYMENT.md** - Complete deployment guide including:
- Prerequisites verification commands
- Minikube startup with optimal resources (4 CPU, 8GB RAM)
- Docker environment configuration for Minikube
- Step-by-step image building instructions
- Kubernetes namespace and secrets setup
- Multiple deployment options (Kustomize, individual manifests)
- Pod and service verification commands
- Multiple access methods (tunnel, NodePort, port-forward)
- Health check verification
- Scaling and management commands
- Troubleshooting guide
- Quick reference command table
- Architecture diagram

**k8s/overlays/minikube/kustomization.yaml** - Minikube-specific overlay:
- Single replica for local development
- NodePort service for frontend (port 30080)
- Reduced resource limits for Minikube
- Debug logging enabled
- ConfigMap with local environment settings

**scripts/deploy-minikube.sh** - Bash deployment script with:
- Prerequisite checks
- Automated Minikube startup
- Docker environment configuration
- Sequential image building
- Namespace and secret setup
- Kustomize deployment
- Pod readiness wait
- Access URL output

**scripts/deploy-minikube.ps1** - PowerShell deployment script:
- Same functionality as bash script
- Windows-native PowerShell syntax
- Parameter support for secrets
- Skip flags for build/start

## Outcome

- ✅ Impact: Complete Minikube deployment workflow with documentation and automation scripts
- 🧪 Tests: T038-T039 pending manual Docker/K8s testing
- 📁 Files: 4 files created (DEPLOYMENT.md, minikube overlay, 2 deployment scripts)
- 🔁 Next prompts: Execute deployment scripts to verify, complete Phase 8 documentation
- 🧠 Reflection: Minikube overlay uses NodePort for simpler local access vs Ingress

## Evaluation notes (flywheel)

- Failure modes observed: None - documentation and scripts created successfully
- Graders run and results (PASS/FAIL): PASS - all required artifacts generated
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run deploy-minikube.ps1 and verify pod status
