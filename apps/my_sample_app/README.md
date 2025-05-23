# A brand new app

Describe the new app in the `packages/index/src/appList.js` file:

```js
export const apps = {
  ...
  whatever_you_want: {
    name: 'My sample app',
    slug: 'my_sample_app',
    kind: 'generic',
    icon: 'wrench'
  }
}
```

Duplicate the application you wanna start from or start from scratch with `my_sample_app`.

If you started from the "my sample app", remember to replace all occurrences of `my_sample_app` with the new slug.
