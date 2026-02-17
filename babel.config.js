module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        chrome: '79',
        firefox: '70',
        edge: '79',
        safari: '13'
      },
      modules: false
    }]
  ],
  plugins: [
    '@babel/plugin-transform-optional-chaining',
    '@babel/plugin-transform-nullish-coalescing-operator'
  ]
};
