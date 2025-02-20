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
kubectl get pods
```

###### 查看当前空间的所有service
```doc
kubectl get sec 
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
kubectl get deployments #查看所有 Deployment名称
kubectl get deployment <pod name> -o yaml # 获取 Deployment 资源定义 
kubectl describe deployment <pod name> # 获取 Deployment 详细信息
```



