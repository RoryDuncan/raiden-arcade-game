import bulletManager from "./bullet-manager.js"

export default class Ship {

    constructor(x = 0, y = 0, color = "#fc6") {
      this.width = 15
      this.height = 30
      this.x = x
      this.y = y
      this.color = color
      this.lastCreatedBullet = 0
      this.shootDelay = 60
    }
    
    step(x, y) {
      this.x = x
      this.y = y
    }
    
    move(x = 0, y = 0) {
      this.x += x;
      this.y += y;
      
      if ( this.x < 0) this.x = 0;
      if ( this.x + this.width > window.innerWidth) this.x = window.innerWidth - this.width
      if (this.y > window.innerHeight) this.y = window.innerHeight
    }
    
    shoot(time) {
      if (time.now >= this.lastCreatedBullet + this.shootDelay) {
        bulletManager.spawnBullet(this.x + ~~(this.width / 2), this.y + 10, false)
        this.lastCreatedBullet = time.now
      }
    }
    
    render($) {
        $.fillStyle(this.color)
        $.fillRect(this.x, this.y, this.width, this.height)
        let w = this.width;
        // right wing
        $.fillRect(this.x + w, this.y + w + 2, w, w)
        // lfet wing
        $.fillRect(this.x - w, this.y + w + 2, w, w)
    }
    
}