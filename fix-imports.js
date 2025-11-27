const fs = require('fs');
const path = require('path');

console.log('🔧 CORRIGINDO TODOS OS IMPORTS...');

const components = [
  'button', 'card', 'input', 'textarea', 'select', 'switch', 
  'badge', 'tabs', 'alertdialog', 'progress', 'pagination',
  'separator', 'sheet', 'checkbox', 'avatar', 'scrollarea',
  'label', 'dialog', 'skeleton', 'tooltip', 'dropdown-menu'
];

let filesFixed = 0;

const files = getAllFiles('src');

files.forEach(file => {
  if (file.endsWith('.jsx') || file.endsWith('.js')) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    components.forEach(comp => {
      const regex = new RegExp(`from\\s+["']@/components/ui/${comp}["']`, 'g');
      content = content.replace(regex, `from "@/components/ui/${comp.charAt(0).toUpperCase() + comp.slice(1)}"`);
    });
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`✅ ${file}`);
      filesFixed++;
    }
  }
});

console.log(`🎉 CORREÇÃO CONCLUÍDA! ${filesFixed} arquivos corrigidos.`);

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && file !== 'node_modules') {
      results = results.concat(getAllFiles(filePath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  
  return results;
}
