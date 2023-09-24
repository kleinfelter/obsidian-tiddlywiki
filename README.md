# Import/Export TiddlyWiki

Import and export from TiddlyWiki with JSON files.


## How to use

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## How does this differ from the original https://github.com/lucasbordeau/obsidian-tiddlywiki

- He exports from Obsidian to TiddlyWiki, with tiddlers in Wikitext format. I added the ability to export them in Markdown format.
- This requires you to install the official TiddlyWiki Markdown plugin.
- The conversion to Wikitext had some gaps. For example, table headers were not converted. I found I had better results with Markdown. There are still a few conversions between Obsidian Markdown to Tiddlywiki Markdown. (The lovely thing about standards is that there are so many to choose from!)
