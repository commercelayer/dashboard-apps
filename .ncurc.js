module.exports = {
  reject: [
    "pnpm"
  ],
  filterResults: (name, { upgradedVersionSemver }) => {
    if (
      name === '@types/node' && parseInt(upgradedVersionSemver?.major) >= 22 ||
      name === 'eslint' && parseInt(upgradedVersionSemver?.major) >= 9 ||
      name === 'zod' && parseInt(upgradedVersionSemver?.major) >= 4 ||
      name === '@hookform/resolvers' && parseInt(upgradedVersionSemver?.major) >= 4
    ) {
      return false
    }

    return true
  }
}