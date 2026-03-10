# XHVerse Site

[![CI](https://github.com/devruji/xhverse-site/actions/workflows/ci.yml/badge.svg)](https://github.com/devruji/xhverse-site/actions/workflows/ci.yml)
[![Coverage](./coverage/badge.svg)](https://github.com/devruji/xhverse-site/actions/workflows/ci.yml)
[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Welcome to the XHVerse Site repository! This is a modern static web application built with [Astro](https://astro.build/).

## 🛠 Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Runtime:** [Bun](https://bun.sh/)
- **Testing:** [Vitest](https://vitest.dev/) (Unit) & [Playwright](https://playwright.dev/) (E2E)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/)

## Features

- Rapid frontend development and high performance.
- Automated testing with Unit and E2E tools.
- Continuous Integration & Deployment (CI/CD) via GitHub Actions.
- Automated deployment to Cloudflare Pages.
- Built and managed with Bun for maximum speed.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0 or higher)

### Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/devruji/xhverse-site.git
cd xhverse-site
bun install
```

### Local Development

Start the development server:

```sh
bun run dev
```

The site will be available at `http://localhost:4321`.

### Testing

Run unit tests with coverage:

```sh
bun run coverage
```

Run end-to-end tests:

```sh
bun run test:e2e
```

### Building for Production

Build the production site locally:

```sh
bun run build
```

The built output will be inside the `./dist/` directory.

## Deployment

This project uses GitHub Actions for CI/CD and is deployed natively to **Cloudflare Pages**.
On every `push` to the `main` branch, the `CI` workflow automatically runs tests and deploys the `dist` directory.

> **Note:** Ensure you have configured your `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `GITHUB_TOKEN` repository secrets for the Cloudflare deployment job to succeed.

## © License & Copyright

This project's code is licensed under the [MIT License](./LICENSE).

**Note:** Unless otherwise stated, all written content, images, and personal media published on the site are **all rights reserved** to the author.
