const curve = level => Math.floor(10 * Math.pow(level, 1.03));

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