import bulletManager from "./bullet-manager.js"

export default class Ship {

    constructor(x = 0, y = 0, color = "#3d8") {
      this.width = 60
      this.height = 30
      this.x = x
      this.y = y
      this.color = color
      this.lastCreatedBullet = 0
      this.shootDelay = 60
      this.isMovingRight = false
      this.isMovingLeft = false
      this.isMovingBack = false
      
    }
    
    step(x, y) {
      this.x = x
      this.y = y
    }
    
    move(x = 0, y = 0) {
      this.x += x;
      this.y += y;
      let padding = 3;
      
      if (x > 0) {
        this.isMovingRight = true
      }
      else {
        this.isMovingRight = false
      }
      
      if (x < 0) {
        this.isMovingLeft = true
      }
      else {
        this.isMovingLeft = false
      }
      
      if (y > 0) {
        this.isMovingBack = true
      }
      else {
        this.isMovingBack = false
      }
      
      if ( this.x <= 0 + this.width * padding) this.x =  this.width * padding;
      if ( this.x + (this.width * padding) >= window.innerWidth) this.x = window.innerWidth - (padding * this.width)
      if (this.y + (this.height * padding) >= window.innerHeight) this.y = (window.innerHeight - this.height * padding)
      if (this.y <= 0 + (this.height * padding)) this.y = 0 + (this.height * padding)
    }
    
    shoot(time) {
      if (time.now >= this.lastCreatedBullet + this.shootDelay) {
        bulletManager.spawnBullet(this.x - 2.5, this.y + 10, false)
        this.lastCreatedBullet = time.now
        this.isShootingFrame = true
      }
      else {
        this.isShootingFrame = false
      }
    }
    
    render($) {
        
      let w = this.width;
      
      $.fillStyle(this.color)
      
      let leftWingOffset = this.x - (this.width / 2);
      let rightWingOffset = this.x + (this.width / 2);
      let triangleHeight = this.y + this.height
      
      
      $.triangle(
        { x: this.x, y: this.y, },
        { x: leftWingOffset, y: triangleHeight, },
        { x: rightWingOffset, y: triangleHeight, },
      )
        .fill()
        .closePath();
    }
    
}