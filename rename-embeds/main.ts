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
        const attachment_dir = (this.app.vault as any).getConfig("attachmentFolderPath").replace(/^\.\//, '');
        console.log(`attachment_dir: `, attachment_dir);

        let embeds = this.app.metadataCache.getFileCache(file)?.embeds;
        if (!embeds) {
            console.log(`No embeds found in file: ${file.path}`);
            new Notice(`No embeds found in file: ${file.path}`);
            return;
        }

        let successCount = 0;
        let errorCount = 0;
        let index = 1;

        for (let embed of embeds) {
            console.log(`embed: `, embed.link);
            let fullpath = this.app.vault.getFileByPath(embed.link);
            if (!fullpath) {
                console.log(`Relative path not found: ${embed.link}`);
                console.log(`Trying absolute path: ${attachment_dir}/${embed.link}`);
                fullpath = this.app.vault.getFileByPath(`${attachment_dir}/${embed.link}`);
            }
            
            if (!fullpath) {
                console.log(`Absolute path also not found: ${attachment_dir}/${embed.link}`);
                errorCount++;
                continue;
            }

            try {
                let dest_filename = `${file.basename}-${index}.${fullpath.extension}`.replace(/\s+/g, "-");
                let dest_fullpath = (await this.app.fileManager.getAvailablePathForAttachment(
                    dest_filename,
                    file.path
                )).replace(/\s+/g, "-");
                
                await this.app.fileManager.renameFile(fullpath, dest_fullpath);
                console.log(`Successfully renamed ${embed.link} to ${dest_fullpath}`);
                new Notice(`Renamed ${embed.link} to ${dest_fullpath}`);
                
                successCount++;
                index++;
            } catch (error) {
                errorCount++;
                console.error(`Failed to rename ${embed.link}: ${error}`);
                new Notice(`Failed to rename ${embed.link}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        // Show summary notice
        if (successCount > 0) {
            new Notice(`Successfully renamed ${successCount} embeds${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        } else if (errorCount > 0) {
            new Notice(`Failed to rename any embeds (${errorCount} errors)`);
        }
    }
}