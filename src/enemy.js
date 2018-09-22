import { Tween } from "@roryduncan/suki/tween";
import { intersects } from "./utils.js"

export class Enemy {
  
  constructor() {
    this.x = 0
    this.y = 0
    const dimension = 14
    this.width = dimension
    this.height = dimension
    this.movementPath = null
    this.color = "#8aa"
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
    let { x, y, width, height } = this;
    
    // slightly boost bullet size for collisions
    width += 20;
    height += 20
    x -= 10
    y -= 10
    
    let isCollided = bulletsList.find( bullet => intersects(bullet, { x, y, width, height }))
    
    if (isCollided) {
      this.die();
    }
  }

  die() {
    
    this.playingDeathAnimation = true;
    
    if (this.movementPath) {
      this.movementPath.stop().remove();
      this.movementPath = null;
    }
    this.color = "#fc6"
    this.movementPath = new Tween();
    this.movementPath
     .from(this)
     .to({ width: this.width * 6, height: this.height * 6, opacity: 0 }, 0.25)
     .on("complete", () => {
       this.isAlive = false
     })
     .start()
  }

  step(time, bulletsList) {
   
   this.checkCollisions(bulletsList);
   
   if (this.movementPath === null) {
     let that = this;
     
     // travel animation
     let target = {
       x: this.x + ((~~(Math.random() * 5)) * (Math.random() >= 0.5 ? 1 : -1)),
       y: window.innerHeight + this.height
     }
     
     this.movementPath = new Tween()
      .from(this)
      .to(target, 3 + Math.random() * 1, "linear")
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
    
    if (this.playingDeathAnimation) {
      
      let w = 10;
      let count = ~~(1 + Math.random() * 3)
      let explosions = new Array(count).fill(true).map( () => {
        
        let xOffset = this.x + ( (this.width / 4) * (Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)))
        let yOffset = this.y + ( (this.width / 4) * (Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)))
        let size = 2 + Math.random() * w;
        return { xOffset, yOffset, size }
      })
      .forEach( ex => {
        $.fillStyle("#fc0")
        $.fillRect(ex.xOffset, ex.yOffset, ex.size, ex.size)
      })
      
    }
    
    if (this.opacity !== 1) $.globalAlpha(1)
  }

}