class FuturisticLines extends Phaser.Sprite {
  constructor() {
    super(game, 0, 0);
    
    this.lines = [];
    this.maxLines = 12;
    this.lineSpeed = 1.2;
    this.tailLength = 100;
    this.spawnRate = 150;
    this.lastSpawnTime = 0;
    
    this.lineColors = [0x76FCFF, 0x4AFCFE, 0x00E5FF, 0x00B8D4];
    this.lineAlpha = 0.3;
    
    this.graphics = game.add.graphics(0, 0);
    this.addChild(this.graphics);
    
    game.add.existing(this);
  }

  update() {
    const currentTime = game.time.now;
    
    if (this.lines.length < this.maxLines && currentTime - this.lastSpawnTime > this.spawnRate) {
      this.spawnLine();
      this.spawnRate = game.rnd.between(150, 2000);
      this.lastSpawnTime = currentTime;
    }
    
    this.updateLines();
    this.drawLines();
  }

  spawnLine() {
    const startY = game.rnd.integerInRange(10, game.height - 10);
    const color = game.rnd.pick(this.lineColors);
    const speed = this.lineSpeed * game.rnd.realInRange(0.9, 1.1);
    
    const line = {
      x: -20,
      y: startY,
      startY: startY,
      points: [{ x: -20, y: startY }],
      color: color,
      speed: speed,
      direction: 0,
      age: 0,
      maxAge: 10000,
      active: true,
      lastDirectionChange: 0,
      nextDirectionChangeTime: game.rnd.integerInRange(1000, 5000), // First change: 1-5 seconds
      state: 'straight' // 'straight', 'angled', 'returning'
    };
    
    this.lines.push(line);
  }

  updateLines() {
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const line = this.lines[i];
      
      if (!line.active) {
        this.lines.splice(i, 1);
        continue;
      }
      
      line.age += game.time.elapsed;
      
      if (line.age > line.maxAge) {
        line.active = false;
        continue;
      }
      
      // Check if it's time to change direction based on state
      if (line.age - line.lastDirectionChange > line.nextDirectionChangeTime) {
        this.changeLineDirection(line);
      }
      
      // Calculate movement
      const angleRad = line.direction * (Math.PI / 180);
      const moveX = line.speed * Math.cos(angleRad);
      const moveY = line.speed * Math.sin(angleRad);
      
      line.x += moveX;
      line.y += moveY;
      
      line.points.push({ x: line.x, y: line.y });
      
      while (line.points.length > 0 && line.points[0].x < line.x - this.tailLength) {
        line.points.shift();
      }
      
      if (line.x > game.width + 100 + this.tailLength || line.y < -50 || line.y > game.height + 50) {
        line.active = false;
      }
    }
  }

  changeLineDirection(line) {
    line.lastDirectionChange = line.age;
    
    if (line.state === 'straight') {
      // First change: from straight to angled (-45° or 45°)
      line.direction = game.rnd.pick([-45, 45]);
      line.state = 'angled';
      line.nextDirectionChangeTime = game.rnd.integerInRange(100, 500);
      
    } else if (line.state === 'angled') {
      // Second change: from angled to straight
      line.direction = 0;
      
      line.state = 'straight';
      line.nextDirectionChangeTime = game.rnd.integerInRange(1000, 5000);
    }
  }

  drawLines() {
    this.graphics.clear();
    
    for (const line of this.lines) {
      if (!line.active || line.points.length < 2) continue;
      
      this.drawTail(line);
      this.drawCap(line);
    }
  }

  drawTail(line) {
    const points = line.points;
    
    for (let i = 1; i < points.length; i++) {
      const startPoint = points[i - 1];
      const endPoint = points[i];
      
      const fadeProgress = i / points.length;
      const alpha = i <= 4 ? 0 : this.lineAlpha * (fadeProgress * 0.9);
      
      this.graphics.lineStyle(1, line.color, alpha);
      this.graphics.moveTo(startPoint.x, startPoint.y);
      this.graphics.lineTo(endPoint.x, endPoint.y);
    }
  }

  drawCap(line) {
    if (line.points.length === 0) return;
    
    const head = line.points[line.points.length - 1];
    
    // Bright 1px center
    this.graphics.beginFill(0xFFFFFF, this.lineAlpha * 1.5);
    this.graphics.drawRect(head.x, head.y, 1, 1);
    
    this.graphics.endFill();
  }

  setDensity(density) {
    this.maxLines = Phaser.Math.clamp(density, 1, 15);
  }

  setSpeed(speed) {
    this.lineSpeed = Phaser.Math.clamp(speed, 0.5, 3);
  }

  setTailLength(length) {
    this.tailLength = Phaser.Math.clamp(length, 20, 100);
  }

  clearLines() {
    this.lines = [];
    this.graphics.clear();
  }

  setColors(colors) {
    this.lineColors = colors;
  }

  setAlpha(alpha) {
    this.lineAlpha = Phaser.Math.clamp(alpha, 0.1, 0.8);
  }

  destroy() {
    this.clearLines();
    this.graphics.destroy();
    super.destroy();
  }
}
