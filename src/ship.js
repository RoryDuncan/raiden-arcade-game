import bulletManager from "./bullet-manager.js"

export default class Ship {

    constructor(x = 0, y = 0, color = "#0bb") {
      this.width = 15
      this.height = 30
      this.x = x
      this.y = y
      this.color = color
    }
    
    step(x, y) {
      this.x = x
      this.y = y
    }
    
    move(x = 0, y = 0) {
      this.x += x;
      this.y += y;
    }
    
    shoot() {
      bulletManager.spawnBullet(this.x, this.y - 10, false)
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