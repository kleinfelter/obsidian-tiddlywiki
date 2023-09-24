import * as fs from "fs";
import * as path from "path";

export interface Tiddler {
	title: string;
	text: string;
	tags?: string;
	created: string;
	modified: string;
}

export type ObsidianMarkdown = {
	title: string;
	content: string;
};

export async function convertObsidianMarkdownToTiddlersMarkdown(directoryPath: string): Promise<Tiddler[]> {
	const tiddlers: Tiddler[] = [];

	const files = fs.readdirSync(directoryPath);

	for (const file of files) {
		if (file.startsWith('.')) {
			// Ignore hidden folders and files
			continue;
		}

		const filePath = path.join(directoryPath, file);

		if (fs.statSync(filePath).isDirectory()) {
			// Recurse into subdirectory
			const subTiddlers = await convertObsidianMarkdownToTiddlersMarkdown(filePath);
			tiddlers.push(...subTiddlers);
		} else if (path.extname(filePath) === '.md') {
			// Parse only .md files
			const fileContent = fs.readFileSync(filePath, 'utf-8');
			const tiddler = convertObsidianMarkdownToTiddler(fileContent, file);
			tiddlers.push(tiddler);
		}
	}

	return tiddlers;
}


export function convertObsidianMarkdownToTiddler(content: string, fileName: string): Tiddler {
	const frontMatterRegex = /^---\n([\s\S]*?)---\n/;
	const frontMatterMatch = content.match(frontMatterRegex);

	let tags = [];
	if (frontMatterMatch) {
		const frontMatter = frontMatterMatch[1];
		const tagsMatch = frontMatter.match(/^tags:\s+(.+)$/m);
		if (tagsMatch) {
			tags.push(tagsMatch[1]);
		}
	}

	const title = fileName.replace(/.md$/, "");

	const { tags: tagsFromText, newText } = extractTagsFromMarkdownText(content)

	tags.push(...tagsFromText)

	const text = convertMarkdownToTiddlyWikiMarkdown(newText);

	const created = new Date().toISOString();
	const modified = created;

	return { title, text, tags: tags.join(' '), created, modified };
}

export function extractTagsFromMarkdownText(text: string): { tags: string[], newText: string } {
	const regex = /(^|\s)#([\w-]+)/g;
	const tags: string[] = [];
	const newText = text.replace(regex, (match, p1, p2) => {
		tags.push(p2);
		return p1;
	}).trim();
	return { tags: [...new Set(tags)], newText };
}

export function convertMarkdownToTiddlyWikiMarkdown(text: string): string {
	let twText = text;


    // rewrite [name](file:///blah)
    // to <a href="file:///blah">name</a>
    // because that's the only way TW's Markdown plugin can handle file: URLs
    const regex = /\[([^\]]+)\]\(file:([^\)]+)\)/g;
    //twText = text.replace(regex, '<a href="file:$2" target="_blank">$1</a>');
    twText = text.replace(regex, '<a href="file:$2" target="_blank">$1</a>');

	// Replace ONLY Links surrounded by [[ and ]]
	twText = twText.replace(/\[\[([^\]]+)\]\]/g, (match, p1) => {
		const linkRegex = /((?:[^\[\]|\\]|\\.)+)(?:\|((?:[^\[\]|\\]|\\.)+))?/;
		const linkMatch = linkRegex.exec(p1);

		if (!linkMatch) return match;

		const linkElement1 = linkMatch[1];
		const linkElement2 = linkMatch[2] ? linkMatch[2] : '';

		// Remove leading | character if there is no description
		return `[[${linkElement2 ? `${linkElement2}|` : ''}${linkElement1}]]`;
	});


	return twText;
}


export async function writeTiddlyWikiJSONFile(tiddlers: Tiddler[], filePath: string) {
	const tiddlyWikiData = {
		fields: ["title", "text", "tags", "created", "modified", "xtype"],
		data: tiddlers.map((tiddler) => Object.values(tiddler)),
	};

	fs.writeFileSync(filePath, JSON.stringify(tiddlyWikiData), "utf-8");
}

export async function exportAllMarkdownFilesToJSONAsMarkdown(directoryPath: string): Promise<any[]> {
	const tiddlers = await convertObsidianMarkdownToTiddlersMarkdown(directoryPath);
	const tiddlerData = tiddlers.map((tiddler: Tiddler) => {
		return {
			title: tiddler.title,
			text: tiddler.text,
			tags: tiddler.tags,
			created: tiddler.created,
			modified: tiddler.modified,
            type: "text/markdown",
		};
	});
	return tiddlerData;
}
