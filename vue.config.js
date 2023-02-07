const config = require(`./config/config.${process.env.NODE_ENV || "default"}.js`);
//const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    publicPath: config.publicPath,
    css: {
      loaderOptions: {
        less: {
          modifyVars: {
            'primary-color': '#1DA57A',
            'link-color': '#1DA57A',
            'border-radius-base': '2px',
          },
          javascriptEnabled: true
        }
      }
    },
    filenameHashing: true,
    devServer:{
        open: process.platform === 'darwin',
        host: '0.0.0.0',
        port: 7031,
        https: false,
        hotOnly: false,
        proxy: null, // string | Object
        before: app => {
            console.log('************************[devServer初始化]**************************')
        }
    },
    configureWebpack: config => {
        console.log('**************************[正式打包注册]******************************')
        console.log(`构建环境变量:${process.env.NODE_ENV}`)
        // if(["api"].includes(process.env.NODE_ENV)){
        //     config.optimization.minimizer.push(
        //         new UglifyJsPlugin()
        //     )
        // }
    },
    chainWebpack: config => {
        config.output.filename('[name].[hash].js').end();
    }
  }
