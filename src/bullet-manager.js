
class BulletManager {
  
  constructor() {
    this.bullets = []
  }
  
  spawnBullet(x, y) {
    
    let speed = 20;
    this.bullets.push(new AllyBullet(x, y, -speed))
    
  }
  
  step() {
    
    // moves all bullets, and determines if they're offscreen
    this.bullets = this.bullets.filter( bullet => {
      bullet.step();
      return !bullet.isOffScreen;
    })
    
  }
  
  render($) {
    this.bullets.forEach( bullet => bullet.render($))
  }
}


class Bullet {
  
  constructor(x, y, speed, color) {
    this.x = x
    this.y = y
    this.speed = speed
    this.color = color
    this.isOffScreen = false
    this.width = 5
    this.height = this.speed
  }
  
  step() {
    this.y += this.speed;
    if (this.y + this.height <= 0) this.isOffScreen = true
    if (this.y + this.height >= window.innerHeight) this.isOffScreen = true
  }
  
  render($) {
    $.fillStyle(this.color)
    $.fillRect(this.x, this.y, this.width, this.height)
  }
}

class AllyBullet extends Bullet {
  
  constructor(x, y, speed,) {
    super(x, y, speed, "#fff")
  }
}

export default new BulletManager();
