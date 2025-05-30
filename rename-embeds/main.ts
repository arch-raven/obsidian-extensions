import {MarkdownView, Notice, Plugin, TFile } from 'obsidian';

export default class EmbedRenamePlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'rename-embeds-in-file',
            name: 'Rename Embeds in Current File',
            callback: () => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView && activeView.file) {
                    this.renameEmbedsInFile(activeView.file);
                } else {
                    new Notice('Please open a markdown file first');
                }
            }
        });

        this.addCommand({
            id: 'rename-embeds-in-all-files',
            name: 'Rename Embeds in All Files',
            callback: () => {
                this.renameEmbedsInAllFiles();
            }
        });
    }

    async renameEmbedsInAllFiles() {
        const markdownFiles = this.app.vault.getMarkdownFiles();
        let totalSuccessCount = 0;
        let totalErrorCount = 0;
        let processedFilesCount = 0;

        for (const file of markdownFiles) {
            try {
                const result = await this.renameEmbedsInFile(file);
                if (result.shouldModify) {
                    processedFilesCount++;
                    totalSuccessCount += result.successCount;
                    totalErrorCount += result.errorCount;
                }
            } catch (error) {
                totalErrorCount++;
                console.error(`Failed to process file ${file.path}: ${error}`);
            }
        }
        console.log(`processedFilesCount: ${processedFilesCount}, totalSuccessCount: ${totalSuccessCount}, totalErrorCount: ${totalErrorCount}`);
        // Show summary notice
        if (processedFilesCount > 0) {
            new Notice(`Processed ${processedFilesCount} files with embeds. Successfully renamed ${totalSuccessCount} embeds${totalErrorCount > 0 ? ` (${totalErrorCount} failed)` : ''}`);
        } else {
            new Notice('No files with embeds found');
        }
    }

    async renameEmbedsInFile(file: TFile): Promise<{ shouldModify: boolean; successCount: number; errorCount: number }> {
        const attachment_dir = (this.app.vault as any).getConfig("attachmentFolderPath").replace(/^\.\//, '');
        console.log(`attachment_dir: `, attachment_dir);

        let embeds = this.app.metadataCache.getFileCache(file)?.embeds || [];
        
        // Filter embeds to only include "Pasted image *" files
        embeds = embeds.filter(embed => /Pasted image/.test(embed.link));

        if (embeds.length === 0) {
            console.log(`No "Pasted image" embeds found in file: ${file.path}`);
            return { shouldModify: false, successCount: 0, errorCount: 0 };
        }

        let successCount = 0;
        let errorCount = 0;
        let index = 1;

        for (let embed of embeds) {
            console.log(`Processing embed: `, embed.link);
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

        return { shouldModify: embeds.length > 0, successCount, errorCount };
    }
}