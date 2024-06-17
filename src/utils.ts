import { App, HeadingCache, TAbstractFile, TFile } from "obsidian";

export function isMarkdownFile(file: TFile | TAbstractFile) {
	return ["md", "markdown"].includes((file as TFile)?.extension ?? "");
}

export function getHeadings(file: TFile, app: App) {
	return app.metadataCache.getFileCache(file)?.headings ?? [];
}

export function trivial(subHeadings: HeadingCache[], result: HeadingCache[], mode: 'default' | 'concise') {
	if(!subHeadings.length) {
		return result;
	}
	const topLevel = subHeadings.reduce((topLevel, cur) => Math.min(topLevel, cur.level), 6);
	const indexesOfTopLevel = subHeadings.reduce((indexes, cur, index) => {
		if(cur.level === topLevel) {
			indexes.push(index);
		}
		return indexes;
	}, [] as number[]);
	if(mode === 'concise') {
		if(indexesOfTopLevel.length >= 1) {
			result.push(subHeadings[indexesOfTopLevel[indexesOfTopLevel.length - 1]]);
		} 
	} else {
		for(let i =0; i < indexesOfTopLevel.length; i++) {
			result.push(subHeadings[indexesOfTopLevel[i]]);
		}
	}
	trivial(subHeadings.slice(indexesOfTopLevel[indexesOfTopLevel.length - 1] + 1), result, mode);
}
