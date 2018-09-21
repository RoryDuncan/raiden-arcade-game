import { Tween } from "@roryduncan/suki/tween";
import { intersects } from "./utils.js"

export class Enemy {
  
  constructor() {
    this.x = 0
    this.y = 0
    const factor = Math.random() * 30
    const dimension = Math.max(4, -10 + factor)
    this.width = dimension
    this.height = dimension
    this.movementPath = null
    this.color = "#777"
    this.opacity = 1
    this.isAlive = true
    this.playingDeathAnimation = false
  }
  
  spawn() {
    // spawn at a random x position
    this.x = 0 + (~~(Math.random() * window.innerHeight))
    // and a y position slightly offscreen
    this.y = -this.height
  }
  
  checkCollisions(bulletsList) {
    
    if (this.playingDeathAnimation || !this.isAlive) return;
    
    let that = this
    let isCollided = bulletsList.find( bullet => intersects(bullet, this))
    
    if (isCollided) {
      
      that.playingDeathAnimation = true;
      if (that.movementPath) {
        that.color = "#ffc"
        that.movementPath.stop().remove();
        that.movementPath = null;
        that.movementPath = new Tween();
        that.movementPath
         .from(that)
         .to({ width: that.width * 6, height: that.height * 6, opacity: 0 }, 0.5)
         .on("complete", () => {
           that.isAlive = false
         })
         .start()
      }
    }
  }

  step(time, bulletsList) {
   
   this.checkCollisions(bulletsList);
   
   if (this.movementPath === null) {
     let that = this;
     
     // travel animation
     let target = {
       x: Math.round(Math.random() * window.innerWidth),
       y: window.innerHeight + this.height
     }
     
     this.movementPath = new Tween()
      .from(this)
      .to(target, 2 + Math.random() * 2)
      .start()
      .on("complete", (tween) => this.isAlive = false)
   }
  }
  
  render($) {
    if (this.opacity !== 1) $.globalAlpha(this.opacity)
    
    $.fillStyle(this.color)
    let halfWidth = Math.round(this.width / 2)
    let halfHeight = Math.round(this.height / 2)
    
    let center = {
      x: this.x - halfWidth,
      y: this.y - halfHeight,
    }
    $.fillRect(center.x, center.y, this.width, this.height)
    
    if (this.opacity !== 1) $.globalAlpha(1)
  }

}