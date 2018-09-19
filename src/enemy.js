import { Tween } from "@roryduncan/suki/tween";

export class Enemy {
  
  constructor() {
    this.x = 0
    this.y = 0
    this.width = 10
    this.height = 10
    this.movementPath = null
    this.color = "#f26"
    this.isAlive = true
  }
  
  spawn() {
    // spawn at a random x position
    this.x = 0 + (~~(Math.random() * window.innerHeight))
    // and a y position slightly offscreen
    this.y = -this.height
  }
  
  isCollided(bulletsList) {
    
  }

  step(time) {
   if (this.movementPath === null) {
     
     let target = {
       x: Math.round(Math.random() * window.innerWidth),
       y: Math.round(Math.random() * (window.innerHeight / 2))
     }
     let that = this;
     this.movementPath = new Tween()
      .from(this)
      .to(target, 2 + Math.random() * 2)
      .start()
      .on("complete", (tween) => {
        this.movementPath = null;
      })
   }
  }
  
  
  
  render($) {
    $.fillStyle(this.color)
    $.fillRect(this.x, this.y, this.width, this.height)
  }

}