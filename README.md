# consult-modulation-web

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### 手动构建方式：

登录到正式服务器

```
git clone -b master git@gitlab.mobimedical.cn:xusiyuan/consultModulationWeb.git consultModulationWeb

cd consultModulationWeb/

docker build -t harbor.mobimedical.cn/rd/api-platform-web:master --build-arg envType=production .

docker push harbor.mobimedical.cn/rd/api-platform-web:master

docker pull harbor.mobimedical.cn/rd/api-platform-web:master

cd /data/scripts

docker-compose up -d
```

### 手动构建私有部署版本方式：

- 1.  在master分支上切一个新分支

```
git branch [对应私有部署的分支名]
git checkout [对应私有部署的分支名]
```

- 2.  修改配置文件

./config.production.js

```
const config = {
    url: "http://api-platform.mobimedical.cn/api/v1/",      //修改该地址为私有部署的接口平台后端访问地址
    v2Url: "http://api-platform.mobimedical.cn/api/v2/",
    iflow2Url: "http://api.runningdoctor.cn/8024/"
}

module.exports = config;
```

- 3.  保存,发布新的分支

```
git add .
git commit -m "this is a comment"
git push origin [对应私有部署的分支名]
```

- 4.  登录到对应构建环境（centos 7.7/docker 19+, 需要有公司harbor服务器的push和pull权限，也可以登录正式服去构建）

```
git clone -b [对应私有部署的分支名] git@gitlab.mobimedical.cn:xusiyuan/consultModulationWeb.git consultModulationWeb

cd consultModulationWeb/

docker build -t harbor.mobimedical.cn/rd/api-platform-web:[对应私有部署的分支名] --build-arg envType=production .

docker push harbor.mobimedical.cn/rd/api-platform-web:[对应私有部署的分支名]
```

- 5.  登录到需要私有部署的服务器上

```
docker pull harbor.mobimedical.cn/rd/api-platform-web:master

//以下步骤需要写好docker-compose脚本及配置好对应nginx，否则请手动运行镜像容器，脚本写法可以参照正式服
cd /data/scripts

docker-compose up -d
```
