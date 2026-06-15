const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
    if (filePath.endsWith('.svelte')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Replace imports
        content = content.replace(/import\s+\{\s*([^}]*)\s*\}\s+from\s+['"]@inertiajs\/svelte['"]/g, (match, imports) => {
            let newImports = imports.replace(/inertia/g, 'navigate').replace(/router/g, 'navigate');
            return `import { ${newImports} } from 'svelte-routing'`;
        });

        // Replace <Link href="..."> with <Link to="...">
        content = content.replace(/<Link([^>]*)href=/g, '<Link$1to=');

        // Replace use:inertia
        content = content.replace(/use:inertia/g, '');

        // Replace router.get, router.post, etc.
        content = content.replace(/router\.get\(/g, 'navigate(');
        content = content.replace(/router\.post\(/g, 'apiFetch(');

        // Fix Components case sensitivity
        content = content.replace(/\.\.\/Components\//g, '../components/');
        content = content.replace(/\.\.\/\.\.\/Components\//g, '../../components/');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Migrated: ${filePath}`);
        }
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
        const files = fs.readdirSync(filePath);
        for (const file of files) {
            processFile(path.join(filePath, file));
        }
    }
}

processFile(srcDir);
console.log('Migration script completed.');
