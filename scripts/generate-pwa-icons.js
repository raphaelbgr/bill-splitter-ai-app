#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// PWA icon sizes for Brazilian market optimization
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Shortcut icons
const shortcutIcons = [
  { name: 'shortcut-divide.png', description: 'Nova Divisão' },
  { name: 'shortcut-groups.png', description: 'Meus Grupos' }
];

// Action icons for notifications
const actionIcons = [
  { name: 'action-open.png', description: 'Abrir' },
  { name: 'action-close.png', description: 'Fechar' }
];

// Badge icon
const badgeIcon = { name: 'badge-72x72.png', description: 'Badge' };

const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Gerando ícones PWA para RachaAI...');

// Generate placeholder files for all required icons
iconSizes.forEach(({ size, name }) => {
  const iconPath = path.join(iconsDir, name);
  if (!fs.existsSync(iconPath)) {
    fs.writeFileSync(iconPath, `# Placeholder for ${size}x${size} PWA icon\n# Replace with actual PNG file`);
    console.log(`✅ Created ${name} (${size}x${size})`);
  }
});

shortcutIcons.forEach(({ name, description }) => {
  const iconPath = path.join(iconsDir, name);
  if (!fs.existsSync(iconPath)) {
    fs.writeFileSync(iconPath, `# Placeholder for shortcut icon: ${description}\n# Replace with actual PNG file`);
    console.log(`✅ Created ${name} (shortcut)`);
  }
});

actionIcons.forEach(({ name, description }) => {
  const iconPath = path.join(iconsDir, name);
  if (!fs.existsSync(iconPath)) {
    fs.writeFileSync(iconPath, `# Placeholder for action icon: ${description}\n# Replace with actual PNG file`);
    console.log(`✅ Created ${name} (action)`);
  }
});

// Create badge icon
const badgePath = path.join(iconsDir, badgeIcon.name);
if (!fs.existsSync(badgePath)) {
  fs.writeFileSync(badgePath, `# Placeholder for badge icon: ${badgeIcon.description}\n# Replace with actual PNG file`);
  console.log(`✅ Created ${badgeIcon.name} (badge)`);
}

console.log('\n📱 Ícones PWA gerados com sucesso!');
console.log('💡 Para produção, substitua os placeholders por ícones PNG reais');
console.log('🎯 Otimizados para o mercado brasileiro com suporte a todos os dispositivos');

// Create a simple SVG icon as an example
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#581c87;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#gradient)"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="200" font-weight="bold" text-anchor="middle" fill="white">R</text>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" fill="white">AI</text>
</svg>
`;

const svgPath = path.join(iconsDir, 'rachaai-icon.svg');
fs.writeFileSync(svgPath, svgIcon);
console.log('✅ Created rachaai-icon.svg (example)');

console.log('\n🚀 PWA pronto para o mercado brasileiro!');
console.log('🇧🇷 Otimizado para redes brasileiras e dispositivos móveis'); 