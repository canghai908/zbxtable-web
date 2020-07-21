module.exports={
  // parser:'sugarss',
  plugins:{
    'postcss-import':{},
    'postcss-preset-env': {
      stage: 0,
      features: {
        'nesting-rules': true,
      },
      // autoprefixer: { grid: true }
      browsers: 'last 2 versions',
      // importFrom:'./playground/src/layoutOpt/global.css',
    },
    'cssnano':{},
    // 'autoprefixer':{},
  },
};