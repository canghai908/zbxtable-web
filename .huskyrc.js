module.exports={
  hooks:{
    'pre-commit':'npm run lint && npm run test',
    // 'pre-push':'npm run test',
    'commit-msg':'commitlint -E HUSKY_GIT_PARAMS',
  },
};
