// @ts-check

/**
 * This script will replace all "version number" occurrences from React and ReactDOM urls so that it will point to the same package.json version.
 * This script runs on "pre-commit" hook.
 * 
 * @example https://cdn.jsdelivr.net/npm/@commercelayer/drop-in.js@2/dist/drop-in/drop-in.esm.js
 * @example `https://esm.sh/react@19.1.0`
 * @example `https://esm.sh/react-dom@19.1.0`
 */

import { replaceInFileSync } from 'replace-in-file'
import packageJson from './packages/index/package.json' with { type: 'json' }

const reactVersion = packageJson.dependencies['react']
const reactDOMVersion = packageJson.dependencies['react-dom']

/** @type { Pick<import('replace-in-file').ReplaceInFileConfig, 'from' | 'to'>[] } */
const tasks = [
  {
    from: /(https:\/\/esm\.sh\/react@)([0-9a-z\.\-]+)/g,
    to: `$1${reactVersion}`
  },
  {
    from: /(https:\/\/esm\.sh\/react-dom@)([0-9a-z\.\-]+)/g,
    to: `$1${reactDOMVersion}`
  }
]

try {
  const results = tasks.flatMap(task => replaceInFileSync({
    dry: false,
    ignore: [
      './node_modules/**',
      './**/node_modules/**'
    ],
    files: [
      './**/*.md*',
      './**/*.ts*',
      './**/*.mts*',
      './**/*.js*',
      './**/*.mjs*',
    ],
    ...task
  }))

  const filteredResults = results.filter(r => r.hasChanged).map(r => r.file)
  let uniqueFilteredResults = [...new Set(filteredResults)];

  if (uniqueFilteredResults.length > 0) {
    console.group('Updating "react" and "react-dom" versions:', )
    uniqueFilteredResults.forEach(r => {
      console.info('→', r)
    })
    console.groupEnd()
  }
} catch (error) {
  console.error('Error occurred:', error)
}
