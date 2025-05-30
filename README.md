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
1. Open the file containing embeds you want to rename
2. Use the command palette (Ctrl/Cmd + P)
3. Search for "Rename Embeds" and select the command
4. The embeds will be renamed to match the file name with an index