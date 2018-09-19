import { SubSystem } from "@roryduncan/suki"
import { Enemy } from "./enemy.js"

class EnemyManager extends SubSystem() {
  
  constructor() {
    super()
    this.enemies = [];
    this.timeLastEnemyWasSpawned = 0
  }
  
  spawnRandomEnemy() {
    console.log("Spawning an enemy");
    let enemy = new Enemy();
    enemy.spawn();
    this.enemies.push(enemy);
  }
  
  shouldSpawnEnemy(time) {
    let delta = time.now - this.timeLastEnemyWasSpawned;
    return delta >= 1000
  }
  
  step(time) {
    
    // spawn enemies
    if (this.enemies.length < 10 && this.shouldSpawnEnemy(time)) {
      this.timeLastEnemyWasSpawned = time.now
      this.spawnRandomEnemy()
    }
    
    this.enemies.filter( enemy => {
      enemy.step(time);
      return enemy.isAlive;
    })
  }
  
  render($) { 
    this.enemies.forEach( enemy => enemy.render($))
  }
}

export default new EnemyManager();