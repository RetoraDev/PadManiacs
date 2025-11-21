const curve = level => Math.floor(10 * Math.pow(level, 1.2));

const levelsToPrint = 25;

function printLevels() {
  console.log('Printing experience requirements up to level', levelsToPrint);
  
  for (let i = 1; i <= levelsToPrint; i++) {
    console.log('  Lv', i, '→', curve(i), 'EXP');
  }
}

function printSkillUnlockChances() {
  console.log('Printing skill unlock chances');
  
  let attempts = 20;
  while(attempts--) {
    let dice = Math.random();
    console.log(' ', 20 - attempts, '→', dice.toFixed(2), 0.5 < dice ? "✓" : "");
  }
}

async function main() {
  printSkillUnlockChances();
}

main();