// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current', // Or specific Node.js version like '18'
        },
      },
    ],
  ],
};
