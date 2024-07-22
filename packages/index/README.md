# Dashboard apps

Any Commerce Layer account comes with a hosted version of these applications, as part of the Dashboard hub, and it is automatically enabled for admin users.
An admin can then enable one or more apps for other organization members giving each member full or read-only access.

It's possible to clone this repository and add one or more apps  to your Dashboard hub, in order to customize every part of the code and start using your own and self-hosted version.

## Table of contents

- [Getting started](#getting-started)
- [Running on Windows](#running-on-windows)
- [Help and support](#need-help)
- [License](#license)


## Getting started
You need a local Node.JS (version 18+) environment and some React.JS knowledge to customize the app code.

1. Fork [this repository](https://github.com/commercelayer/dashboard-apps) (you can learn how to do this [here](https://help.github.com/articles/fork-a-repo)).

2. Clone the forked repository like so:

```bash
git clone https://github.com/<your username>/dashboard-apps.git && cd dashboard-apps
```

3. Set your environment by creating a new `/src/app/.env.local` file starting from `/src/app/.env` (not required for local development)


4. Install dependencies and run the development server:

```
pnpm install
pnpm dev
```

5. The app will run in development mode at `http://localhost:5173/`. 
In order to authenticate the app, you need to add an integration access token as URL query param. Example: `http://localhost:5173/?accessToken=<integration-token-for-local-dev>`.
That access token is only required (and will work only) for development mode. In production mode the Commerce Layer Dashboard hub will generate a valid access token, based on the current user.

6. Modify the app to satisfy your requirements. 
All our Dashboard apps are built using a shared component library [@commercelayer/app-elements](https://github.com/commercelayer/app-elements).
You can browse the [official documentation](https://github.com/commercelayer/app-elements) to discover more about this topic.

7. Deploy the forked repository to your preferred hosting service. You can deploy with one click below:

[<img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify" height="35">](https://app.netlify.com/start/deploy?repository=https://github.com/commercelayer/dashboard-apps#PUBLIC_SELF_HOSTED_SLUG)
[<img src="https://vercel.com/button" alt="Deploy to Vercel" height="35">](https://vercel.com/new/clone?repository-url=https://github.com/commercelayer/dashboard-apps&build-command=pnpm%20build%3Aelements%20%26%26%20pnpm%20build%3Aapps&output-directory=dist&env=PUBLIC_SELF_HOSTED_SLUG&envDescription=your%20organization%20slug) 

8. Complete the configuration in the Dashboard hub by setting your app URL.

## Running on Windows
[Read more](https://github.com/commercelayer/.github/blob/main/PNPM_ON_WINDOWS.md)

## Need help?

1. Join [Commerce Layer's Slack community](https://slack.commercelayer.app).

2. Create an [issue](https://github.com/commercelayer/dashboard-apps/issues) in this repository.

3. Ping us on [X](https://x.com/commercelayer).

## License

This repository is published under the [MIT](LICENSE) license
