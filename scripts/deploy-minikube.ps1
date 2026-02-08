# =============================================================================
# Minikube Deployment Script for Todo Application (PowerShell)
# Phase 4: Cloud-Native Kubernetes Deployment
# =============================================================================

param(
    [switch]$SkipBuild,
    [switch]$SkipMinikubeStart,
    [string]$DatabaseUrl,
    [string]$AuthSecret,
    [string]$OpenAIKey
)

$ErrorActionPreference = "Stop"

# Configuration
$NAMESPACE = "todo-app"
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

Write-Host "=== Todo App Minikube Deployment ===" -ForegroundColor Blue
Write-Host "Project Root: $PROJECT_ROOT"

# Helper functions
function Write-Status {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[X] $Message" -ForegroundColor Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Host "`nChecking prerequisites..." -ForegroundColor Blue

    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed"
        exit 1
    }
    Write-Status "Docker is installed"

    if (-not (Get-Command minikube -ErrorAction SilentlyContinue)) {
        Write-Error "Minikube is not installed"
        exit 1
    }
    Write-Status "Minikube is installed"

    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Write-Error "kubectl is not installed"
        exit 1
    }
    Write-Status "kubectl is installed"
}

# Start Minikube
function Start-MinikubeCluster {
    if ($SkipMinikubeStart) {
        Write-Warning "Skipping Minikube start"
        return
    }

    Write-Host "`nStarting Minikube..." -ForegroundColor Blue

    $status = minikube status 2>&1
    if ($status -match "Running") {
        Write-Status "Minikube is already running"
    } else {
        minikube start --cpus=4 --memory=8192 --driver=docker
        Write-Status "Minikube started"
    }

    # Enable addons
    minikube addons enable ingress
    minikube addons enable metrics-server
    Write-Status "Ingress and metrics-server addons enabled"
}

# Configure Docker environment
function Set-DockerEnvironment {
    Write-Host "`nConfiguring Docker to use Minikube..." -ForegroundColor Blue
    & minikube -p minikube docker-env --shell powershell | Invoke-Expression
    Write-Status "Docker configured to use Minikube's daemon"
}

# Build Docker images
function Build-DockerImages {
    if ($SkipBuild) {
        Write-Warning "Skipping Docker image build"
        return
    }

    Write-Host "`nBuilding Docker images..." -ForegroundColor Blue

    Push-Location $PROJECT_ROOT

    try {
        Write-Host "Building backend image..."
        docker build -t todo-backend:latest -f backend/Dockerfile ./backend
        Write-Status "Backend image built"

        Write-Host "Building frontend image..."
        docker build -t todo-frontend:latest -f frontend/Dockerfile ./frontend
        Write-Status "Frontend image built"

        if (Test-Path "ai-agent") {
            Write-Host "Building AI agent image..."
            docker build -t todo-ai-agent:latest -f ai-agent/Dockerfile ./ai-agent
            Write-Status "AI agent image built"
        }
    }
    finally {
        Pop-Location
    }
}

# Setup namespace and secrets
function Set-NamespaceAndSecrets {
    Write-Host "`nSetting up Kubernetes namespace and secrets..." -ForegroundColor Blue

    # Create namespace if it doesn't exist
    $ns = kubectl get namespace $NAMESPACE 2>&1
    if ($LASTEXITCODE -ne 0) {
        kubectl create namespace $NAMESPACE
        Write-Status "Namespace $NAMESPACE created"
    } else {
        Write-Status "Namespace $NAMESPACE already exists"
    }

    # Check if secrets exist
    $secret = kubectl get secret todo-secrets -n $NAMESPACE 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Warning "Secrets already exist. Skipping secret creation."
        Write-Warning "To update secrets, run: kubectl delete secret todo-secrets -n $NAMESPACE"
    } else {
        if ($DatabaseUrl -and $AuthSecret) {
            kubectl create secret generic todo-secrets `
                --namespace=$NAMESPACE `
                --from-literal=DATABASE_URL="$DatabaseUrl" `
                --from-literal=AUTH_SECRET="$AuthSecret" `
                --from-literal=OPENAI_API_KEY="$OpenAIKey"
            Write-Status "Secrets created"
        } else {
            Write-Warning "Secrets not found. Please create secrets manually:"
            Write-Host @"
  kubectl create secret generic todo-secrets ``
    --namespace=$NAMESPACE ``
    --from-literal=DATABASE_URL="your-database-url" ``
    --from-literal=AUTH_SECRET="your-auth-secret" ``
    --from-literal=OPENAI_API_KEY="your-openai-key"
"@
        }
    }
}

# Deploy to Kubernetes using Helm
function Deploy-ToKubernetes {
    Write-Host "`nDeploying to Kubernetes with Helm..." -ForegroundColor Blue

    Push-Location $PROJECT_ROOT

    try {
        # Check if Helm release already exists
        $release = helm status todo-app --namespace $NAMESPACE 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Upgrading existing Helm release..."
            helm upgrade todo-app k8s/helm/todo-app --namespace $NAMESPACE --wait --timeout 5m0s
            Write-Status "Helm release upgraded"
        } else {
            Write-Host "Installing new Helm release..."
            helm install todo-app k8s/helm/todo-app --namespace $NAMESPACE --create-namespace --wait --timeout 5m0s
            Write-Status "Helm release installed"
        }
    }
    finally {
        Pop-Location
    }
}

# Wait for pods
function Wait-ForPods {
    Write-Host "`nWaiting for pods to be ready..." -ForegroundColor Blue

    kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=120s
    Write-Status "Backend pods ready"

    kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=120s
    Write-Status "Frontend pods ready"
}

# Print access info
function Show-AccessInfo {
    Write-Host "`n=== Deployment Complete ===" -ForegroundColor Blue

    Write-Host "`nAccess the application:" -ForegroundColor Green
    Write-Host "  Run: minikube service frontend -n $NAMESPACE --url"

    Write-Host "`nUseful commands:" -ForegroundColor Green
    Write-Host "  View pods:      kubectl get pods -n $NAMESPACE"
    Write-Host "  View logs:      kubectl logs -f deployment/backend -n $NAMESPACE"
    Write-Host "  Port forward:   kubectl port-forward service/frontend 3000:3000 -n $NAMESPACE"
    Write-Host "  Scale backend:  kubectl scale deployment/backend --replicas=3 -n $NAMESPACE"
    Write-Host "  Delete all:     helm uninstall todo-app -n $NAMESPACE"
}

# Main execution
function Main {
    Test-Prerequisites
    Start-MinikubeCluster
    Set-DockerEnvironment
    Build-DockerImages
    Set-NamespaceAndSecrets
    Deploy-ToKubernetes
    Wait-ForPods
    Show-AccessInfo
}

Main
