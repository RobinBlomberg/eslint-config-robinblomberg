const { defineConfig } = require('npm-check-updates');

module.exports = defineConfig({
  reject: ['eslint-plugin-unicorn'],
  target: (name) => {
    return ['eslint', 'typescript'].includes(name) ? 'minor' : 'latest';
  },
});
