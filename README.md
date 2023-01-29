<p align="center">
  <img src="public/square.svg" alt="Square logo" width="200px" height="200px">
</p>

# Square - Tailwind, liveblocks.io & React Flow Learning Project

This project, named "Square", is aimed at exploring the use of Tailwind CSS, liveblocks.io, and React Flow in a Next.js environment. The code quality is not the best, but it is functional.

## Tech Stack

- Next.js
- Tailwind CSS
- liveblocks.io
- React Flow

## Demo

Demo link: https://square-blond.vercel.app/

## Getting Started

You need the liveblocks token.

Access https://liveblocks.io/, log in, select the project development and go to API Keys, then, copy the Public API Key.

Now you can past at the `.env`

```.env
NEXT_PUBLIC_LIVE_BLOCKS_PUBLIC_KEY=<PASTE HERE>
```

To run the project locally, clone the repository and install the dependencies with:

```bash
npm install
```

Then run the following command to generate the Tailwind CSS:

```bash
npm run tailwind:generate
```

Finally, start the development server with:

```bash
npm run dev
```

The app will be running on http://localhost:3000.

## Contributing

Feel free to contribute to the project by submitting pull requests or reporting issues. Let's learn and grow together!

## Deploy

<a href="https://vercel.com/import/git?s=https%3A%2F%2Fgithub.com%2Fyour-username%2Fsquare">
  <img src="https://vercel.com/button" alt="Add to Vercel">
</a>
