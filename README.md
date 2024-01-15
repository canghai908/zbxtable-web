[English](./README.md) | 简体中文

# zbxtable-web

ZbxTable 前端页面

[![Build Status](https://drone.cactifans.org/api/badges/canghai908/zbxtable-web/status.svg?ref=refs/heads/2.1)](https://drone.cactifans.org/canghai908/zbxtable-web)

## 开发

``` 
yarn install
yarn serve
```

访问 http://127.0.0.1:8080

## 构建

环境：nodejs>10

构建

``` 
yarn install
yarn build
```

构建后的代码默认会存放到 web 文件夹

## 部署

建议使用 nginx， 配置文件如下

``` 
server {
        listen 8088;
        server_name  localhost;
        root    /usr/local/zbxtable/web;
        location /v1 {
                proxy_set_header X-Forwarded-For $remote_addr;
                proxy_set_header Host            $http_host;
                proxy_pass http://127.0.0.1:8084;
        }
        location /  {
                try_files $uri /index.html;
        }

}
```

拷贝生成的前端文件到/usr/local/zbxtable/web 目录

``` 
cp -a web/* /usr/local/zbxtable/web
```

8084 为 zbxtable 后端程序端口, 重启 nginx 即可使用http://ip:8088 访问系统, 默认账号:admin，密码: Zbxtable
