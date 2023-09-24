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

## Known Defects

* SEV1: Obsidian uses `[[filename|Name_to_render]]` and TW Markdown uses `[[Name_to_render|tiddler_name]]`. I need to reverse those pieces when exporting.
* SEV3: It exports the "created" and "modified" fields in this format: "2023-09-24T03:47:47.002Z" and TW expects this format: "20230924hhmm00000"
  * Note that hours is GMT and Washington is 7 hours behind (in the summer). Unless you add 7 (or 8) hours, TW will display a day earlier than created/modified.
  * See https://tiddlywiki.com/static/DateFormat.html
  * But the exporter just uses the date of the export, not the Obsidian document's dates, so you'll need to get the underlying file's timestamps.

* SEV4: Obsidian allows you to escape the vertical bar of `[[filename\|Name_to_render]]` everywhere. TW only allows it in a table cell. You need to use it in a table cell when your name_to_render doesn't match the filename, because the table processor will "consume" the bar to format the table.  Solution: Behavioral -- Don't escape the vertical bar except in table cells.
