###### 切换上下文-不同集群
```doc
kubectx
```  

###### 根据当前的上下文选择空间
```doc
kubens 
```

###### 查看当前集群节点
```doc
kubectl get nodes
```

###### 查看当前空间的所有pods
```doc
kubectl get pods #当前空间pod
kubectl get pods -A  #所有空间pod
```

###### 查看当前空间的所有service
```doc
kubectl get svc #当前命名空间（Namespace）中的 Service
kubectl get svc -A  #显示所有命名空间中的 Service
```

###### 当前空间的所有ingress
```doc
kubectl get ingress -A 
```

###### 查看pod日志
```doc
kubectl logs <pod name>
kubectl logs -f <pod name>
```

###### 查看资源
```doc
Pod:
kubectl get pods  #当前空间pod
kubectl get pods -A  # 获取所有命名空间的 Pod
kubectl get pods -A  | fzf #查找指定的名称
kubectl get pods -n <namespace>  # 获取特定命名空间的 Pod
kubectl describe pod <pod_name> #当前空间的pod明细
kubectl describe pod <pod_name> -n <namespace> #指定空间的pod明细
kubectl get pod <pod_name> -o yaml # 获取 Pod 的 YAML 资源定义

Deployments:
kubectl get deployments #查看当前空间下所有 deployment 名称，等同于命令 kubectl get deploy
kubectl get deployments -A #查看所有空间下的deployment
kubectl get deployments -A | fzf #查找指定的名称
 kubectl get deployments -n <namespace> #指定空间的deployment列表
kubectl get deployment <deployment name> -o yaml # 获取 Deployment 资源定义 
kubectl describe deployment <deployment name> # 获取 Deployment 详细信息

Service:
kubectl get svc #当前命名空间（Namespace）中的 Service
kubectl get svc -A  #显示所有命名空间中的 Service
kubectl get svc -A | fzf #查找指定的名称
kubectl get svc -n <namespace>  #查看特定命名空间的所有 Service
kubectl get service <service_name> -o yaml  # 获取 service 资源定义
kubectl describe service <service_name>  # 获取 service 详细信息

CronJob：
kubectl get cronjob
kubectl get cronjob -A  # 查看所有命名空间的 CronJob
kubectl get cronjob -A  | fzf #查找指定的名称
kubectl get cronjob -n <namespace>  # 查看指定命名空间的 CronJob
kubectl get cronjob <cronjob-name> -o yaml -n <namespace> #查看yaml资源

Job:
kubectl get job 
kubectl get job -A  # 查看所有命名空间的 Job
kubectl get cronjob -A | fzf #查找指定的名称
kubectl get job -n <namespace>  # 查看指定命名空间的 Job
kubectl get job <job-name> -o yaml -n <namespace>  #查看yaml资源


```





