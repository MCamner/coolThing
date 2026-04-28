# coolThing

A collection of small tools, scripts, and retro web experiments.

## Live site

GitHub Pages:

```text
https://mcamner.github.io/coolThing/
```

## Project structure

```text
coolThing/
├── docs/
│   ├── index.html
│   ├── megamovietube.html
│   └── mega-guitar/
│       ├── index.html
│       ├── app.js
│       └── styles.css
├── tools/
│   ├── README.md
│   └── connect-any-repo.sh
├── README.md
├── LICENSE
└── .gitignore
```

## Web experiments

### Mega Movie Tube

Retro 90s MTV-inspired web experiment.

File:

```text
docs/megamovietube.html
```

### Mega Guitar Tabs

Mini-app concept for generating guitar tabs from a YouTube link.

Files:

```text
docs/mega-guitar/index.html
docs/mega-guitar/app.js
docs/mega-guitar/styles.css
```

Live path:

```text
https://mcamner.github.io/coolThing/mega-guitar/
```

## Tools

### connect-any-repo.sh

Shell script that connects any local folder to any GitHub repository.

Run from repo root:

```bash
chmod +x tools/connect-any-repo.sh
./tools/connect-any-repo.sh
```

## Folder rules

```text
docs/  = GitHub Pages, HTML, CSS, JS, browser UI
tools/ = shell scripts, CLI utilities, automation
```

## License

MIT
