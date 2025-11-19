// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'git add',
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write',
    'git add',
  ],
  '*.{css,scss}': [
    'prettier --write',
    'git add',
  ],
};


