module.exports = {
  ci: {
    collect: {
      // Tell Lighthouse CI to run on the built static files
      staticDistDir: './public',
    },
    assert: {
      // Define the performance budget
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      // Upload reports to temporary public storage
      target: 'temporary-public-storage',
    },
  },
};
