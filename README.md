# Dashboard apps

Any Commerce Layer account comes with the hosted version of a full set of Dashboard applications, automatically enabled for admin users. An admin can then enable one or more apps for other organization members giving each member full or read-only access. For an updated list of the available applications, check the [`./apps`](apps) folder of this repository or read more [here](https://commercelayer.github.io/app-elements/?path=/docs/getting-started-applications--docs).

It's possible to clone this repository and add one or more apps to your Dashboard, in order to customize every part of the code and start using your own self-hosted version. For more information on how to do it, read more [here](https://commercelayer.github.io/app-elements/?path=/docs/getting-started-custom-apps--docs). 

## Table of contents

- [Getting started](#getting-started)
- [Running on Windows](#running-on-windows)
- [Help and support](#need-help)
- [License](#license)


## Getting started

You need a local Node.js (version 20+) environment and some React knowledge to customize the app code.

1. Create a new repository from [this template](https://github.com/new?template_owner=commercelayer&template_name=dashboard-apps) (if you want to contribute you can start from a fork instead).

2. Clone the newly created repository like so:

```bash
git clone https://github.com/<your username>/dashboard-apps.git && cd dashboard-apps
```

3. Install dependencies and run the development server:

```
pnpm install
pnpm dev
```

4. The "router" app will run in development mode at http://localhost:5173. The "router" app is the orchestrator for all other applications,  and it is available only for local development as an alternative to the Dashboard.\
In order to authenticate the app, you need to add an integration access token as URL query param. Example: `http://localhost:5173/?accessToken=<integration-token-for-local-dev>`.
That access token is only required (and will work only) for development mode. In production mode, the Commerce Layer Dashboard will generate a valid access token, based on the current user.

5. Modify any application you need to satisfy your requirements. Applications are stored inside the [`./apps`](apps) folder.
All our Dashboard apps are built using a shared component library [@commercelayer/app-elements](https://github.com/commercelayer/app-elements).
You can browse the [official documentation](https://commercelayer.github.io/app-elements/?path=/docs/getting-started-welcome--docs) to discover more about this topic.

7. Build all applications into the `./dist` folder:

```
pnpm build:apps
```


7. Deploy the forked repository to your preferred hosting service. You can deploy with one click below:

[<img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify" height="35">](https://app.netlify.com/start/deploy?repository=https://github.com/commercelayer/dashboard-apps#PUBLIC_SELF_HOSTED_SLUG)
[<img src="https://vercel.com/button" alt="Deploy to Vercel" height="35">](https://vercel.com/new/clone?repository-url=https://github.com/commercelayer/dashboard-apps&build-command=pnpm%20build%3Aelements%20%26%26%20pnpm%20build%3Aapps&output-directory=dist&env=PUBLIC_SELF_HOSTED_SLUG&envDescription=your%20organization%20slug) 

8. Create a [custom app](https://commercelayer.github.io/app-elements/?path=/docs/getting-started-custom-apps--docs) in the Commerce Layer Dashboard.

## Running on Windows
[Read more](https://github.com/commercelayer/.github/blob/main/PNPM_ON_WINDOWS.md)

## Need help?

1. Join [Commerce Layer's Slack community](https://slack.commercelayer.app).

2. Create an [issue](https://github.com/commercelayer/dashboard-apps/issues) in this repository.

3. Ping us on [X](https://x.com/commercelayer).

## License

This repository is published under the [MIT](LICENSE) license
