
const config = {
    url: "http://localhost:7001/v1/",
    v2Url: "http://localhost:7001/v2/",
    iflow2Url: "http://localhost:8024/",
    modules: {
        statistics: true,
        apiGroupManage: true,
        config: true,
        pushLog: true,
        iflowLog: true,
        userManage: true,
    },
    publicPath: '/'
}

module.exports = config;
