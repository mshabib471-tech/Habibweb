const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.');
files.forEach(file => {
  if (file.endsWith('.html')) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Standardize brand header and sidebar displays to Habib iFix .Tech
    content = content.replace(
      /<span class="text-xs font-black tracking-wider uppercase brand-name-habib">Habib iFix<\/span>/g,
      '<span class="text-xs font-black tracking-wider uppercase brand-name-habib">Habib iFix <span class="text-[10px] font-mono text-cyan-400 font-bold">.Tech</span></span>'
    );

    content = content.replace(
      /Habib iFix<span class="text-\[11px\] font-mono text-cyan-400 font-bold ml-0.5 whitespace-nowrap">\.(?:tech|TECH)<\/span>/g,
      'Habib iFix<span class="text-[11px] font-mono text-cyan-400 font-bold ml-0.5 whitespace-nowrap">.Tech</span>'
    );

    content = content.replace(
      /<span class="font-black text-slate-900 text-lg">Habib iFix <span class="text-blue-600 font-bold">\.(?:tech|Tech|TECH)<\/span><\/span>/g,
      '<span class="font-black text-slate-900 text-lg">Habib iFix <span class="text-cyan-600 font-bold">.Tech</span></span>'
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully updated branding in:', file);
  }
});
console.log('All HTML files branded with Habib iFix .Tech successfully.');
