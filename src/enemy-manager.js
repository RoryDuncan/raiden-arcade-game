import { SubSystem } from "@roryduncan/suki"
import { Enemy } from "./enemy.js"


class EnemyManager extends SubSystem() {
  
  constructor(maxEnemies = 25) {
    super()
    this.enemies = [];
    this.timeLastEnemyWasSpawned = 0
    this.maxEnemies = maxEnemies
  }
  
  spawnRandomEnemy() {
    let enemy = new Enemy()
    enemy.spawn()
    this.enemies.push(enemy)
  }
  
  shouldSpawnEnemy(time) {
    let delta = time.now - this.timeLastEnemyWasSpawned;
    return delta >= 100
  }
  
  step(time, bullets) {
    
    // spawn enemies
    if (this.enemies.length < this.maxEnemies && this.shouldSpawnEnemy(time)) {
      this.timeLastEnemyWasSpawned = time.now
      this.spawnRandomEnemy()
    }
    
    this.enemies = this.enemies.filter( enemy => {
      enemy.step(time, bullets);
      return enemy.isAlive;
    })
  }
  
  render($) { 
    this.enemies.forEach( enemy => enemy.render($))
  }
}

export default new EnemyManager();