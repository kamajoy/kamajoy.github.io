# php

init...

```shell
docker run --detach \
  --hostname gitlab.local \
  --publish 8433:443 --publish 8033:80 --publish 2233:22 \
  --name gitlab \
  --restart always \
  --volume $HOME/gitlab/config:/etc/gitlab \
  --volume $HOME/gitlab/logs:/var/log/gitlab \
  --volume $HOME/gitlab/data:/var/opt/gitlab \
  gitlab/gitlab-ce:13.8.8-ce.0

```

> /opt/gitlab/embedded/service/gitlab-shell/hooks/pre-receive.d
> mkdir -p /opt/gitlab/embedded/service/gitlab-shell/hooks/pre-receive.d/
