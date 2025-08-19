// This file can be used to suppress Sass deprecation warnings
// Add this to package.json scripts to suppress warnings temporarily:

// Option 1: In package.json dev script, add --quiet flag
// "dev": "next dev --quiet"

// Option 2: Set environment variable to suppress warnings
// SASS_SILENCE_DEPRECATIONS=true npm run dev

// Option 3: Create a custom Sass configuration
module.exports = {
  sassOptions: {
    silenceDeprecations: ['import'],
    includePaths: ['./src'],
  },
}
