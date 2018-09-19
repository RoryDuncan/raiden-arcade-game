
import { suki, events } from "@roryduncan/suki";
import keyboard from "@roryduncan/suki/keyboard"
import Ship from "./ship.js"

import bulletManager from "./bullet-manager.js"
import enemyManager from "./enemy-manager.js"

const ship = new Ship(window.innerWidth / 2, window.innerHeight / 2);

suki.whenReady(() => {
    suki.start()
    keyboard.capture();
})


suki.events.on(events.STEP, (time, $) => {
    
    let shipMovement = 5;
    
    if (keyboard.pressed.includes("left"))  ship.move(-shipMovement, 0);
    if (keyboard.pressed.includes("right")) ship.move( shipMovement, 0);
    if (keyboard.pressed.includes("up"))    ship.move(0, -shipMovement);
    if (keyboard.pressed.includes("down"))  ship.move(0,  shipMovement);
    if (keyboard.pressed.includes("space")) ship.shoot();
    
    enemyManager.step(time)
    bulletManager.step(time)
})

suki.events.on(events.RENDER, (time, $) => {
  $.clear("#266")
  bulletManager.render($)
  enemyManager.render($)
  ship.render($)
})