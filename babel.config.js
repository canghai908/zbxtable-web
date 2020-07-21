const config=api=>{
  api.cache.using(() => process.env.NODE_ENV === 'development');
  const presets=[
    [
      '@babel/preset-env',
      {
        // modules:'commonjs',
        modules:false,
        loose: true,
        useBuiltIns: 'usage',
        shippedProposals:true,
        corejs: {
          version: 3,
          proposals: true,
        },
        targets: {
          browsers: ['last 2 versions'],
          // esmodules: true,
        },
      },
    ],
    '@babel/preset-react',
  ];

  const plugins=[
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: 'css',//'css',
      },
    ],
    [
      'import',
      {
        'libraryName': '@material-ui/core',
        'libraryDirectory': 'esm',
        'camel2DashComponentName': false,
      },
      'core',
    ],
    [
      'import',
      {
        'libraryName': '@material-ui/icons',
        'libraryDirectory': 'esm',
        'camel2DashComponentName': false,
      },
      'icons',
    ],
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    ['@babel/plugin-proposal-pipeline-operator',{proposal:'minimal'}],
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-proposal-class-properties',{loose:true}],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: true,
        regenerator: true,
        useESModules: false,
        corejs: false, /* {
          version: 3,
          proposals: true,
        }, */
      },
    ],
  ];

  const env={
    development: {
      presets: [
        '@babel/preset-env',
      ],
      plugins: [
        'react-hot-loader/babel',
      ],
    },
    production: {
      plugins: [],
    },
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
      ],
    },
  };

  return {
    presets,
    plugins,
    env,
  };
};

module.exports=config;



