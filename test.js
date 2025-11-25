const curve = level => Math.floor(8 * Math.pow(level, 1.02));

const levelsToPrint = 25;

function printLevels() {
  console.log('Printing experience requirements up to level', levelsToPrint);
  
  for (let i = 1; i <= levelsToPrint; i++) {
    console.log('  Lv', i, '→', curve(i), 'EXP');
  }
}

async function main() {
  printLevels();
}

main();