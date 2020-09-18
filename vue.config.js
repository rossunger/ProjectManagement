module.exports = {
    lintOnSave: "error",
    css: {
      loaderOptions: {
        sass: {
          implementation: require('sass'), // This line must in sass option
        },
      },
    },
    devServer: {
      host: '0.0.0.0'
    }       
  }
  