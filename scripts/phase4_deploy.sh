#!/bin/bash
# =============================================================================
# Phase IV Deployment Script - Helm-Based Kubernetes Deployment
# Project: Todo App (Cloud-Native)
# =============================================================================

set -euo pipefail

NAMESPACE="todo-app"
RELEASE_NAME="todo-app"
CHART_PATH="k8s/helm/todo-app"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Step 1: Prerequisites Check
# =============================================================================
check_prerequisites() {
    log_info "Checking prerequisites..."

    local missing=0

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        missing=1
    else
        log_ok "Docker: $(docker --version | head -1)"
    fi

    if ! command -v minikube &> /dev/null; then
        log_error "Minikube is not installed"
        missing=1
    else
        log_ok "Minikube: $(minikube version --short 2>/dev/null || echo 'installed')"
    fi

    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        missing=1
    else
        log_ok "kubectl: $(kubectl version --client --short 2>/dev/null || echo 'installed')"
    fi

    if ! command -v helm &> /dev/null; then
        log_error "Helm is not installed"
        missing=1
    else
        log_ok "Helm: $(helm version --short 2>/dev/null || echo 'installed')"
    fi

    if [ "$missing" -eq 1 ]; then
        log_error "Missing prerequisites. Please install the required tools."
        exit 1
    fi

    log_ok "All prerequisites satisfied."
}

# =============================================================================
# Step 2: Start Minikube (if not running)
# =============================================================================
start_minikube() {
    log_info "Checking Minikube status..."

    if minikube status --format='{{.Host}}' 2>/dev/null | grep -q "Running"; then
        log_ok "Minikube is already running."
    else
        log_info "Starting Minikube..."
        minikube start --cpus=4 --memory=8192 --driver=docker
        log_ok "Minikube started."
    fi

    log_info "Enabling addons..."
    minikube addons enable ingress 2>/dev/null || true
    minikube addons enable metrics-server 2>/dev/null || true
    log_ok "Addons enabled."
}

# =============================================================================
# Step 3: Configure Docker Environment
# =============================================================================
configure_docker() {
    log_info "Configuring Docker to use Minikube daemon..."
    eval $(minikube docker-env)
    log_ok "Docker configured for Minikube."
}

# =============================================================================
# Step 4: Build Docker Images
# =============================================================================
build_images() {
    log_info "Building Docker images..."

    cd "$PROJECT_ROOT"

    log_info "Building backend image..."
    docker build -t todo-backend:latest -f backend/Dockerfile ./backend
    log_ok "Backend image built."

    log_info "Building frontend image..."
    docker build -t todo-frontend:latest -f frontend/Dockerfile ./frontend
    log_ok "Frontend image built."

    log_ok "All images built successfully."
}

# =============================================================================
# Step 5: Deploy with Helm
# =============================================================================
deploy_helm() {
    log_info "Deploying with Helm..."

    cd "$PROJECT_ROOT"

    # Check if release already exists
    if helm status "$RELEASE_NAME" --namespace "$NAMESPACE" &> /dev/null; then
        log_info "Upgrading existing Helm release..."
        helm upgrade "$RELEASE_NAME" "$CHART_PATH" \
            --namespace "$NAMESPACE" \
            --wait \
            --timeout 5m
        log_ok "Helm release upgraded."
    else
        log_info "Installing new Helm release..."
        helm install "$RELEASE_NAME" "$CHART_PATH" \
            --namespace "$NAMESPACE" \
            --create-namespace \
            --wait \
            --timeout 5m
        log_ok "Helm release installed."
    fi
}

# =============================================================================
# Step 6: Verify Deployment
# =============================================================================
verify_deployment() {
    log_info "Verifying deployment..."

    log_info "Pods:"
    kubectl get pods -n "$NAMESPACE"

    log_info "Services:"
    kubectl get services -n "$NAMESPACE"

    log_info "Ingress:"
    kubectl get ingress -n "$NAMESPACE" 2>/dev/null || log_warn "No ingress found."

    log_info "Helm release status:"
    helm status "$RELEASE_NAME" --namespace "$NAMESPACE"

    log_ok "Deployment verification complete."
}

# =============================================================================
# Main Execution
# =============================================================================
main() {
    echo "=============================================="
    echo "  Phase IV Deployment - Helm + Kubernetes"
    echo "  Todo App (Cloud-Native)"
    echo "=============================================="
    echo ""

    check_prerequisites
    echo ""
    start_minikube
    echo ""
    configure_docker
    echo ""
    build_images
    echo ""
    deploy_helm
    echo ""
    verify_deployment
    echo ""

    log_ok "=============================================="
    log_ok "  Phase IV deployment complete!"
    log_ok "  Run 'minikube tunnel' to access the app."
    log_ok "=============================================="
}

main "$@"
