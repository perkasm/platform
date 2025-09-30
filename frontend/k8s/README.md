# Kubernetes Deployment Guide - PerkAsm Frontend

This directory contains Kubernetes manifests for deploying the PerkAsm frontend application to a Kubernetes cluster.

## 📋 Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl CLI installed and configured
- Docker image built and pushed to registry
- Nginx Ingress Controller installed
- cert-manager installed (for TLS certificates)

## 🗂 Files Overview

- `namespace.yaml` - Creates the perkasm namespace
- `configmap.yaml` - Environment-specific configuration
- `deployment.yaml` - Main application deployment with HPA, PDB, and ServiceAccount
- `service.yaml` - ClusterIP service for internal communication
- `ingress.yaml` - Ingress rules for external access with TLS

## 🚀 Quick Start

### 1. Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Deploy ConfigMap

```bash
# For production
kubectl apply -f k8s/configmap.yaml

# Edit the ConfigMap to set your API URL
kubectl edit configmap perkasm-frontend-config -n perkasm
```

### 3. Deploy Application

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n perkasm -l app=perkasm-frontend

# Check deployment
kubectl get deployment perkasm-frontend -n perkasm

# Check service
kubectl get svc perkasm-frontend -n perkasm

# Check ingress
kubectl get ingress perkasm-frontend -n perkasm

# View logs
kubectl logs -n perkasm -l app=perkasm-frontend --tail=50 -f
```

## 🔧 Configuration

### Environment Variables

Edit `configmap.yaml` to set environment-specific values:

```yaml
data:
  VITE_API_URL: "https://api.perkasm.com"
  VITE_ENVIRONMENT: "production"
  ENABLE_ANALYTICS: "true"
  ENABLE_ERROR_TRACKING: "true"
```

### Resource Limits

Default resource allocation (per pod):

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi
```

Adjust in `deployment.yaml` based on your needs.

### Scaling

The deployment includes:

- **Fixed replicas**: 3 (configurable in deployment.yaml)
- **Horizontal Pod Autoscaler (HPA)**:
  - Min replicas: 3
  - Max replicas: 10
  - CPU threshold: 70%
  - Memory threshold: 80%

```bash
# Check HPA status
kubectl get hpa perkasm-frontend-hpa -n perkasm

# Manual scaling (overrides HPA)
kubectl scale deployment perkasm-frontend --replicas=5 -n perkasm
```

### TLS/SSL Configuration

The ingress is configured to use cert-manager for automatic TLS certificates:

```yaml
tls:
  - hosts:
    - perkasm.com
    - www.perkasm.com
    secretName: perkasm-frontend-tls
```

Ensure cert-manager is installed:

```bash
# Install cert-manager (if not already installed)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## 🏥 Health Checks

The deployment includes three types of probes:

1. **Liveness Probe**: Checks if container is alive
   - Endpoint: `/health`
   - Initial delay: 10s
   - Period: 30s

2. **Readiness Probe**: Checks if container can serve traffic
   - Endpoint: `/ready`
   - Initial delay: 5s
   - Period: 10s

3. **Startup Probe**: For slow-starting containers
   - Endpoint: `/health`
   - Initial delay: 0s
   - Period: 5s
   - Failure threshold: 12 (60s total)

```bash
# Check health status
kubectl describe pod <pod-name> -n perkasm
```

## 🔒 Security Features

- **Non-root user**: Container runs as user 1001
- **Read-only root filesystem**: Enhanced security
- **Security context**: Drops all capabilities
- **Pod Security Standards**: Restricted profile
- **Network Policy**: Restricts ingress/egress traffic
- **Service Account**: Dedicated service account per deployment

## 📊 Monitoring

### Pod Status

```bash
# Watch pods
kubectl get pods -n perkasm -l app=perkasm-frontend -w

# Describe pod for detailed info
kubectl describe pod <pod-name> -n perkasm

# Get pod resource usage
kubectl top pod -n perkasm -l app=perkasm-frontend
```

### Logs

```bash
# View logs for all pods
kubectl logs -n perkasm -l app=perkasm-frontend --tail=100

# Follow logs
kubectl logs -n perkasm -l app=perkasm-frontend -f

# Logs from specific pod
kubectl logs -n perkasm <pod-name>

# Previous pod logs (if crashed)
kubectl logs -n perkasm <pod-name> --previous
```

### Events

```bash
# View events
kubectl get events -n perkasm --sort-by='.lastTimestamp'

# Events for specific deployment
kubectl describe deployment perkasm-frontend -n perkasm
```

## 🔄 Updates & Rollbacks

### Rolling Update

```bash
# Update image
kubectl set image deployment/perkasm-frontend \
  frontend=perkasm/frontend:v2.0.0 \
  -n perkasm

# Watch rollout status
kubectl rollout status deployment/perkasm-frontend -n perkasm

# View rollout history
kubectl rollout history deployment/perkasm-frontend -n perkasm
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/perkasm-frontend -n perkasm

# Rollback to specific revision
kubectl rollout undo deployment/perkasm-frontend --to-revision=2 -n perkasm
```

### Zero-Downtime Deployment

The deployment uses:
- RollingUpdate strategy
- maxSurge: 1 (1 extra pod during update)
- maxUnavailable: 0 (no downtime)
- PodDisruptionBudget: minAvailable=1

## 🧹 Cleanup

### Delete Resources

```bash
# Delete all resources
kubectl delete -f k8s/

# Delete specific resources
kubectl delete deployment perkasm-frontend -n perkasm
kubectl delete service perkasm-frontend -n perkasm
kubectl delete ingress perkasm-frontend -n perkasm

# Delete namespace (removes everything)
kubectl delete namespace perkasm
```

## 🐛 Troubleshooting

### Pod not starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n perkasm

# Check pod logs
kubectl logs <pod-name> -n perkasm

# Check events
kubectl get events -n perkasm --sort-by='.lastTimestamp'
```

### Service not accessible

```bash
# Check service endpoints
kubectl get endpoints perkasm-frontend -n perkasm

# Test service internally
kubectl run -it --rm debug --image=alpine --restart=Never -n perkasm -- sh
# Inside the pod:
wget -O- http://perkasm-frontend/health
```

### Ingress not working

```bash
# Check ingress status
kubectl describe ingress perkasm-frontend -n perkasm

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Check certificate
kubectl describe certificate perkasm-frontend-tls -n perkasm
```

### High resource usage

```bash
# Check resource usage
kubectl top pod -n perkasm -l app=perkasm-frontend

# Adjust resource limits in deployment.yaml
# Then apply changes
kubectl apply -f k8s/deployment.yaml
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)

## 🎯 Production Checklist

Before deploying to production:

- [ ] Update ConfigMap with production API URLs
- [ ] Configure proper resource limits
- [ ] Set up cert-manager and TLS certificates
- [ ] Configure monitoring and alerting
- [ ] Set up log aggregation
- [ ] Test health check endpoints
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Review security policies
- [ ] Test disaster recovery procedures

---

**Last Updated**: September 30, 2025
