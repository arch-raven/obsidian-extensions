# Obsidian Rename Embeds Plugin

Renames all embeddings in a selected markdown file to match the file name with an index.

## Installation

```bash
OBSIDIAN_PLUGINS_DIR="/path-to-vault/.obsidian/plugins"
PLUGIN_NAME="rename-embeds"
cd $PLUGIN_NAME 
npm install && npm run build 
cp main.js manifest.json "$OBSIDIAN_PLUGINS_DIR/$PLUGIN_NAME/"
```

## Usage
1. Use the command palette (Ctrl/Cmd + P)
2. Choose either:
   - "Rename Embeds in Current File" - renames embeds in the active file
   - "Rename Embeds in All Files" - renames embeds in all markdown files