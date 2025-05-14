###### 切换上下文-不同集群
```sh
kubectx
```

###### 根据当前的上下文选择空间
```sh
kubens
```

###### 查看当前集群节点
```sh
kubectl get nodes
```

###### 列出集群中的所有命名空间
```sh
kubectl get ns
kubectl create ns <namespace>
kubectl create namespace <namespace>
kubectl delete ns <namespace>
kubectl delete namespace <namespace>

```

##### 搜索
```sh
kubectl get all -n  <namespace> 用于查看指定命名空间（namespace）中几乎所有类型的资源
kubectl get all -A 查看所有命名空间的资源
kubectl get pods,services -n <namespace>  查看特定资源类型
kubectl get all -n <namespace> -o yaml 以 YAML 格式输出
kubectl get all -n <namespace> -o json 以  JSON 格式输出

```

###### 查看当前空间的所有 Pods
```sh
kubectl get pods # 当前空间 pod
kubectl get pods -A  # 所有空间 pod
kubectl get pods -n <namespace>  # 获取特定命名空间的 Pod
kubectl describe pod <pod_name>  # 当前空间的 pod 详情
kubectl describe pod <pod_name> -n <namespace>  # 指定空间的 pod 详情
kubectl get pod <pod_name> -o yaml  # 获取 Pod 的 YAML 资源定义
kubectl get pods -A | fzf  # 查找指定的名称
```

###### 查看当前空间的所有 Service
```sh
kubectl get svc # 当前命名空间中的 Service
kubectl get svc -A  # 显示所有命名空间中的 Service
kubectl get svc -n <namespace>  # 查看特定命名空间的所有 Service
kubectl get svc -A | fzf  # 查找指定的名称
kubectl get service <service_name> -o yaml  # 获取 Service 资源定义
kubectl describe service <service_name>  # 获取 Service 详细信息
```

###### 查看当前空间的所有 Ingress
```sh
kubectl get ingress -A
kubectl get ingress <ingress-name> -o yaml -n <namespace>  # 查看 YAML 资源
kubectl describe ingress <ingress-name> -n <namespace>  # 查看特定 Ingress 详情
```

###### 查看 Pod 日志
```sh
kubectl logs <pod_name>
kubectl logs -f <pod_name>
```

###### 查看 Deployment 相关信息
```sh
kubectl get deployments  # 当前空间 Deployment
kubectl get deployments -A  # 所有空间 Deployment
kubectl get deployments -n <namespace>  # 指定空间的 Deployment
kubectl get deployments -A | fzf  # 查找指定的名称
kubectl get deployment <deployment_name> -o yaml  # 获取 Deployment 资源定义
kubectl describe deployment <deployment_name>  # 获取 Deployment 详细信息
```

###### 查看 CronJob 相关信息
```sh
kubectl get cronjob  # 当前空间 CronJob
kubectl get cronjob -A  # 所有空间 CronJob
kubectl get cronjob -n <namespace>  # 指定空间的 CronJob
kubectl get cronjob -A | fzf  # 查找指定的名称
kubectl get cronjob <cronjob-name> -o yaml -n <namespace>  # 查看 YAML 资源
```

###### 查看 Job 相关信息
```sh
kubectl get job  # 当前空间 Job
kubectl get job -A  # 所有空间 Job
kubectl get job -n <namespace>  # 指定空间的 Job
kubectl get job -A | fzf  # 查找指定的名称
kubectl get job <job-name> -o yaml -n <namespace>  # 查看 YAML 资源
```

###### 查看 ConfigMap 相关信息
```sh
kubectl get configmap  # 当前空间 ConfigMap
kubectl get configmap -A  # 所有空间 ConfigMap
kubectl get configmap -n <namespace>  # 指定空间的 ConfigMap
kubectl get configmap -A | fzf  # 查找指定的名称
kubectl get configmap <configmap-name> -o yaml -n <namespace>  # 查看 YAML 资源
kubectl describe configmap <configmap-name> -n <namespace>  # 查看 ConfigMap 详情
```

###### 查看 Secrets 相关信息
```sh
kubectl get secrets  # 当前空间 Secrets
kubectl get secrets -A  # 所有空间 Secrets
kubectl get secrets -n <namespace>  # 指定空间的 Secrets
kubectl get secrets -A | fzf  # 查找指定的名称
kubectl get secret <secret-name> -o yaml -n <namespace>  # 查看 YAML 资源
kubectl describe secret <secret-name> -n <namespace>  # 查看 Secret 详情
```

###### 查看 Kubernetes 资源使用情况
```sh
kubectl top node  # 查看节点的资源使用情况
kubectl top pod  # 查看 Pod 的资源使用情况
kubectl top pod -n <namespace>  # 查看特定命名空间 Pod 的资源使用情况
```

###### 删除资源
```sh
kubectl delete pod <pod_name>  # 删除 Pod
kubectl delete deployment <deployment_name>  # 删除 Deployment
kubectl delete svc <service_name>  # 删除 Service
kubectl delete ingress <ingress_name>  # 删除 Ingress
kubectl delete configmap <configmap_name>  # 删除 ConfigMap
kubectl delete secret <secret_name>  # 删除 Secret
```

###### 进入 Pod 容器
```sh
kubectl exec -it <pod_name> -- /bin/sh  # 进入 Pod（Alpine 等轻量级镜像）
kubectl exec -it <pod_name> -- /bin/bash  # 进入 Pod（Debian/Ubuntu 等）
```

###### 应用 YAML 配置
```sh
kubectl apply -f <file.yaml>  # 应用 YAML 配置
kubectl delete -f <file.yaml>  # 删除 YAML 配置
```

###### 获取当前 K8s 版本信息
```sh
kubectl version  # 获取本地和服务器端的版本
kubectl cluster-info  # 获取集群信息
```

###### 监控 Kubernetes 事件
```sh
kubectl get events --sort-by=.metadata.creationTimestamp  # 按时间排序查看事件
kubectl get events -A  # 获取所有命名空间的事件
```

###### 资源自动补全（建议开启）
```sh
source <(kubectl completion bash)  # Bash 自动补全
source <(kubectl completion zsh)  # Zsh 自动补全
```
