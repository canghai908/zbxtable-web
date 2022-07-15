English | [简体中文](./README.zh-CN.md)

# zbxtable-web

ZbxTable front end

## Getting Started

``` 
yarn install
yarn serve
```

Visit  http://127.0.0.1:8080

## Build

nodejs>10

``` 
yarn install
yarn build
```

The built code will be stored in the web folder 

## Deploy

It is recommended to use nginx, the configuration file is as follows:

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

Copy the generated front-end files to the /usr/local/zbxtable/web directory

``` 
cp -a web/* /usr/local/zbxtable/web
```

8084 is the zbxtable back-end program port, restart nginx to access the system using http://ip:8088, the default account: admin, password: Zbxtable
