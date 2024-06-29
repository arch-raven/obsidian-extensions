import {MarkdownView, Notice, Plugin, TFile } from 'obsidian';

export default class EmbedRenamePlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'rename-embeds-in-file',
            name: 'Rename Embeds in Current File',
            checkCallback: (checking: boolean) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView && activeView.file) {
                    if (!checking) {
                        this.renameEmbedsInFile(activeView.file);
                    }
                    return true;
                }
                return false;
            }
        });
    }

    async renameEmbedsInFile(file: TFile) {
        const attachment_dir = this.app.vault.getConfig("attachmentFolderPath");
        console.log(`attachment_dir: `, attachment_dir);

        let embeds =  this.app.metadataCache.getFileCache(file)?.embeds;
        if (!embeds) {
            console.log(`No embeds found in file: `, file.path);
            new Notice(`No embeds found in file: ${file.path}`);
            return;
        }

        for (let embed of embeds) {
            console.log(`embed: `, embed);
            let fullpath = this.app.vault.getFileByPath(embed.link);
            if (!fullpath) {
                console.log(`Relative path Not Found: `, embed.link);
                console.log(`Trying absolute path: : `, `${attachment_dir}/${embed.link}`);
                fullpath = this.app.vault.getFileByPath(`${attachment_dir}/${embed.link}`);
            }
            
            if (!fullpath) {
                console.log(`Absolute path also not found: `, `${attachment_dir}/${embed.link}`);
                continue;
            }

            let dest_fullpath = await this.app.fileManager.getAvailablePathForAttachment(`${file.basename}.${fullpath.extension}`, file.path);
            await this.app.fileManager.renameFile(fullpath, dest_fullpath);
            console.log(`Renamed ${fullpath.path} to ${dest_fullpath}`);
            new Notice(`Renamed ${fullpath.path} to ${dest_fullpath}`);

        }
    }
}