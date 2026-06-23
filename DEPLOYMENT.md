# Deployment: AWS and Kubernetes

This document describes the GitHub Actions workflows added to this repo and the required secrets for deploying to AWS (ECR/ECS, S3/CloudFront) and Kubernetes.

Workflows added:

- `.github/workflows/backend-aws.yml` — Builds backend Docker image, pushes to ECR, registers ECS task definition (using `k8s/ecs-task-def-template.json`), forces new deployment on ECS service.
- `.github/workflows/frontend-aws.yml` — Builds frontend and syncs `frontend/dist` to S3 bucket, creates CloudFront invalidation.
- `.github/workflows/deploy-k8s.yml` — Uses a base64-encoded kubeconfig (GitHub secret `KUBE_CONFIG`) to run `kubectl apply -f k8s/` and optionally builds/pushes backend image to a registry then applies manifests.

Required repository secrets (GitHub Actions):

- `AWS_ACCESS_KEY_ID` — AWS access key with limited permissions for ECR, ECS, S3, CloudFront.
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` — e.g. `us-east-1`.
- `ECR_REGISTRY` — ECR registry hostname (account-id.dkr.ecr.region.amazonaws.com).
- `ECR_REPOSITORY` — ECR repository name for backend images.
- `ECS_CLUSTER` — ECS cluster name to update.
- `ECS_SERVICE` — ECS service name to update.
- `S3_BUCKET` — S3 bucket name for frontend hosting.
- `CLOUDFRONT_DISTRIBUTION_ID` — CloudFront distribution ID (optional).
- `CONTAINER_REGISTRY` — Container registry URL used by Kubernetes workflow (if pushing images).
- `CONTAINER_REPOSITORY` — Repository name in `CONTAINER_REGISTRY`.
- `KUBE_CONFIG` — base64-encoded kubeconfig for the target cluster.

Repository changes and flow notes:

- Add `k8s/ecs-task-def-template.json` containing an ECS task definition template compatible with `aws ecs register-task-definition` where the workflow replaces the container image.
- Add Kubernetes manifests under `k8s/` such as `auth-deployment.yaml` and `auth-service.yaml`. Use placeholder `__IMAGE_PLACEHOLDER__` in deployment manifests; the workflow will replace it with the built image URI.
- Ensure each service has a working `Dockerfile` (workflows assume `backend-platform/services/auth-service/Dockerfile`).

Security and IAM:
- Create an IAM user with scoped permissions: ECR push, ECS register/update service, S3 sync permissions for the bucket, CloudFront invalidation, and container registry push if used. Avoid granting full admin rights.

Kubeconfig secret generation example:

```bash
# On macOS/Linux
cat ~/.kube/config | base64 | tr -d '\n' | pbcopy
# Paste into GitHub secret `KUBE_CONFIG`
```

Local testing tips:
- Use `scripts/build_local.py` to run migrations, build backend and frontend locally.
- Test docker image builds locally before pushing to ECR.
- Validate `kubectl apply -f k8s/` against a staging cluster before using production credentials.

