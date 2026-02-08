#!/bin/bash
# =============================================================================
# Minikube Deployment Script for Todo Application
# Phase 4: Cloud-Native Kubernetes Deployment
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="todo-app"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}=== Todo App Minikube Deployment ===${NC}"
echo -e "Project Root: ${PROJECT_ROOT}"

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    echo -e "\n${BLUE}Checking prerequisites...${NC}"

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_status "Docker is installed"

    if ! command -v minikube &> /dev/null; then
        print_error "Minikube is not installed"
        exit 1
    fi
    print_status "Minikube is installed"

    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    print_status "kubectl is installed"
}

# Start Minikube
start_minikube() {
    echo -e "\n${BLUE}Starting Minikube...${NC}"

    if minikube status | grep -q "Running"; then
        print_status "Minikube is already running"
    else
        minikube start --cpus=4 --memory=8192 --driver=docker
        print_status "Minikube started"
    fi

    # Enable addons
    minikube addons enable ingress
    minikube addons enable metrics-server
    print_status "Ingress and metrics-server addons enabled"
}

# Configure Docker environment
configure_docker() {
    echo -e "\n${BLUE}Configuring Docker to use Minikube...${NC}"
    eval $(minikube docker-env)
    print_status "Docker configured to use Minikube's daemon"
}

# Build Docker images
build_images() {
    echo -e "\n${BLUE}Building Docker images...${NC}"

    cd "${PROJECT_ROOT}"

    echo "Building backend image..."
    docker build -t todo-backend:latest -f backend/Dockerfile ./backend
    print_status "Backend image built"

    echo "Building frontend image..."
    docker build -t todo-frontend:latest -f frontend/Dockerfile ./frontend
    print_status "Frontend image built"

    if [ -d "ai-agent" ]; then
        echo "Building AI agent image..."
        docker build -t todo-ai-agent:latest -f ai-agent/Dockerfile ./ai-agent
        print_status "AI agent image built"
    fi
}

# Create namespace and secrets
setup_namespace() {
    echo -e "\n${BLUE}Setting up Kubernetes namespace and secrets...${NC}"

    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    print_status "Namespace ${NAMESPACE} created/verified"

    # Check if secrets exist
    if kubectl get secret todo-secrets -n ${NAMESPACE} &> /dev/null; then
        print_warning "Secrets already exist. Skipping secret creation."
        print_warning "To update secrets, delete and recreate: kubectl delete secret todo-secrets -n ${NAMESPACE}"
    else
        print_warning "Secrets not found. Please create secrets manually:"
        echo -e "  kubectl create secret generic todo-secrets \\"
        echo -e "    --namespace=${NAMESPACE} \\"
        echo -e '    --from-literal=DATABASE_URL="your-database-url" \'
        echo -e '    --from-literal=AUTH_SECRET="your-auth-secret" \'
        echo -e '    --from-literal=OPENAI_API_KEY="your-openai-key"'
    fi
}

# Deploy to Kubernetes using Helm
deploy() {
    echo -e "\n${BLUE}Deploying to Kubernetes with Helm...${NC}"

    cd "${PROJECT_ROOT}"

    # Check if Helm release already exists
    if helm status todo-app --namespace ${NAMESPACE} &> /dev/null; then
        echo "Upgrading existing Helm release..."
        helm upgrade todo-app k8s/helm/todo-app --namespace ${NAMESPACE} --wait --timeout 5m
        print_status "Helm release upgraded"
    else
        echo "Installing new Helm release..."
        helm install todo-app k8s/helm/todo-app --namespace ${NAMESPACE} --create-namespace --wait --timeout 5m
        print_status "Helm release installed"
    fi
}

# Wait for pods to be ready
wait_for_pods() {
    echo -e "\n${BLUE}Waiting for pods to be ready...${NC}"

    kubectl wait --for=condition=ready pod -l app=backend -n ${NAMESPACE} --timeout=120s
    print_status "Backend pods ready"

    kubectl wait --for=condition=ready pod -l app=frontend -n ${NAMESPACE} --timeout=120s
    print_status "Frontend pods ready"
}

# Print access information
print_access_info() {
    echo -e "\n${BLUE}=== Deployment Complete ===${NC}"

    FRONTEND_URL=$(minikube service frontend -n ${NAMESPACE} --url 2>/dev/null || echo "Run: minikube service frontend -n ${NAMESPACE} --url")

    echo -e "\n${GREEN}Access the application:${NC}"
    echo -e "  Frontend URL: ${FRONTEND_URL}"
    echo -e "\n${GREEN}Useful commands:${NC}"
    echo -e "  View pods:      kubectl get pods -n ${NAMESPACE}"
    echo -e "  View logs:      kubectl logs -f deployment/backend -n ${NAMESPACE}"
    echo -e "  Port forward:   kubectl port-forward service/frontend 3000:3000 -n ${NAMESPACE}"
    echo -e "  Scale backend:  kubectl scale deployment/backend --replicas=3 -n ${NAMESPACE}"
    echo -e "  Delete all:     helm uninstall todo-app -n ${NAMESPACE}"
}

# Main execution
main() {
    check_prerequisites
    start_minikube
    configure_docker
    build_images
    setup_namespace
    deploy
    wait_for_pods
    print_access_info
}

# Run main function
main "$@"
