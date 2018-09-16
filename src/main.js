
import { suki, events } from "@roryduncan/suki";
import keyboard from "@roryduncan/suki/keyboard"
import Ship from "./ship.js"

import bulletManager from "./bullet-manager.js"

const ship = new Ship(window.innerWidth / 2, window.innerHeight / 2);

suki.whenReady(() => {
    suki.start()
    keyboard.capture();
})


suki.events.on(events.STEP, (time, $) => {
    
    let shipMovement = 5;
    
    switch (keyboard.pressed[0]) {
      case "left":  ship.move(-shipMovement, 0); break;
      case "right": ship.move( shipMovement, 0); break;
      case "up":    ship.move(0, -shipMovement); break;
      case "down":  ship.move(0,  shipMovement); break;
    }
    
    bulletManager.step()
    
    if (keyboard.any(["space"])) {
        ship.shoot();
    }
})

suki.events.on(events.RENDER, (time, $) => {
  $.clear("#266")
  bulletManager.render($)
  ship.render($)
})