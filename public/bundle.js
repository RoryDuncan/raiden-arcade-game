(function () {
  'use strict';

  const errorMessage = (method, item) => `EventEmitter.${method} is missing ${item}.`;
  const isNullOrUndefined = (val) => val == null || typeof val == "undefined";

  class EventEmitter {
    
    constructor() {
     this._events = {};
     this._allowed = {};
     
     this.addEventListener = this.on;
     this.removeEventListener = this.off;
    }
    
    on(event, fn, data) {
      
      if (isNullOrUndefined(event)) throw new Error(errorMessage("on", "an event name"))
      if (isNullOrUndefined(fn)) throw new Error(errorMessage("on", "a callback function"))
      
      this._events[event] = this._events[event] || [];
      this._events[event].push({ event, fn, data});
      
      // if an event is disabled, we keep it disabled, otherwise we default to enabled
      if (isNullOrUndefined(this._allowed[event])) this._allowed[event] = true;
      
      return this;
    }
    
    off(event, fn) {
      
      if (isNullOrUndefined(event)) throw new Error(errorMessage("off", "an event name"))
      
      // remove all events if a specific callback is not provided
      if (isNullOrUndefined(fn)) {
        this._events[event] = [];
        delete this._allowed[event];
      }
      else {
        let events = this._events[event] || [];
        this._events[event] = events.filter(el => el.fn != fn);
      }
      
      return this;
    }
    
    trigger(event, ...data) {
      
      if (isNullOrUndefined(event)) throw new Error(errorMessage("trigger", "an event name"))
      
      if (this._allowed[event] === false) return this;
      
      let events = this._events[event] || [];
      events.forEach((e) => e.fn(...data, e.data || null));
      
      return this;
    }
    
    once(event, fn, data) {
      
      let _fn = (...data) => {
        this.off(event, _fn);
        fn(...data, data || null);
      };
      
      this.on(event, _fn, data);
    }
    
    enable(event) {
      this._allowed[event] = true;
      return this;
    }
    
    disable(event) {
      this._allowed[event] = false;
      return this;
    }
  }

  const valueReturningMethods = [
    "getImageData",
    "createImageData",
    "isPointInStroke",
    "isPointInPath"
  ];

  let chainMethod = function(wrapper, fn, isGetter) {
    if (isGetter) {
      return (...args) => fn.apply(wrapper.context, args)
    }
    else return (...args) => {
      fn.apply(wrapper.context, args); 
      return wrapper
    }
  };

  // chains a property as a function
  // ->   ctx.text(value) instead of ctx.text = value
  let chainProperty = function(wrapper, key) {
    return (value) => {
      if (typeof value == "undefined") {
        return wrapper.context[key]
      }
      wrapper.context[key] = value;
      return wrapper
    }
  };

  // not defined as a class because we programmatically create the prototype below.
  class Context {
    
    constructor(width = 500, height = 500) {
      
      this.canvas = document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;
      let context = this.context = this.canvas.getContext("2d");
    
      // extend the canvas's context
      // for-in iterates over prototype methods, as well
      for (let key in context) {
        let value = context[key];
        let isGetter = false;
        
        // detect if it's a method or a property
        if (typeof value == "function") {
          
          if (valueReturningMethods.includes(key)) {
            isGetter = true;
          }
          
          this[key] = chainMethod(this, value, isGetter);
        }
        else if (key != "canvas") {
          this[key] = chainProperty(this, key);
        }
      }
    }
  }

  /* global CanvasRenderingContext2D */

  class Renderer extends Context {
    
    constructor(width, height, scale = 1, smoothing = false) {
      super(width, height);
      this.isOffscreenCanvas = true;
      this.imageSmoothingEnabled(smoothing);
    }
    
    // Adds the canvas to the target element
    // defaults to the body
    addCanvasToDOM(target = document.body) {
      
      if (!target.appendChild) {
        throw new Error("Renderer.addCanvasToDOM did not recieve a DOM node")
      }
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.canvas.id = "renderer";
      this.isOffscreenCanvas = false;
      target.appendChild(this.canvas);
      return this
    }
    
    // Creates a triangle path 
    triangle(point1, point2, point3) {
      
      if (arguments.length < 3) {
        throw new Error("Renderer.triangle has less than three arguments.")
      }
      
      this.beginPath();
      this.moveTo(point1.x, point1.y);
      this.lineTo(point2.x, point2.y);
      this.lineTo(point3.x, point3.y);
      this.closePath();
      return this
    }
    
    strs(...args) {
      this.save();
      return this.trs.call(this, ...args)
    }
    
    trs(x = 0, y = 0, rotation = 0, scale = 1) {
      this.translate(x, y)
        .rotate(rotation)
        .scale(scale, scale);
      return this
    }
    
    // Saves, executes all parameter functions, then restores
    do(...actions) {
      this.save();
      actions.forEach(action => action());
      this.restore();
      return this
    } 
    
    clear(color = "#fff") {
      return this.fillStyle(color).fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    
    fillWith(color = "#000") {
      return this.fillStyle(color).fill()
    }
    
    fillWith(color = "#000") {
      return this.strokeStyle(color).stroke()
    }
    
    dimensions() {
      
      let width = this.canvas.width;
      let height = this.canvas.height;
      return {x: 0, y: 0, width, height}
    }
    
    cache() {
      let {x, y, width, height} = this.dimensions();
      return this.getImageData(x, y, width, height)
    }
    
    resize(w, h) {
      
      let data = this.cache();
      this.canvas.width = w;
      this.canvas.height = h;
      this.putImageData(data, 0, 0);
      return this
    }
    
    draw(target, x = 0, y = 0, width = this.canvas.width, height = this.canvas.height) {
      
      // only allows drawing on Renderer instances
      if (!(target instanceof Renderer)) {
        throw new TypeError("Incorrect argument type. Should be Renderer")
      }
      
      let source = this.dimensions();
      
      let data = this.getImageData(source.x, source.y, source.width, source.height);
      this.putImageData(data, x, y, width, height);
      
    }
    
  }

  const defer = (fn) => window.setTimeout(fn, 0);

  const events = {
    READY: "ready",
    START: "start",
    STOP: "stop",
    TICK: "tick",
    STEP: "step",
    PRERENDER: "pre-render",
    RENDER: "render",
    POSTRENDER: "post-render",
  };

  /* 
      Suki
      
      connects our primary renderer, an event emitter, a game loop, and such
  */
  class Suki {
    
    constructor() {
      
      const that    = this;
      this.running  = false;
      this.isReady  = false;
      this.events   = new EventEmitter();
      this.renderer = new Renderer();
      this.$        = this.renderer;
      this.canvas   = this.renderer.canvas;
      this.stats    = {
        skippedFrames: 0,
        fps: () => {
          return 1000/that.time().lastRenderDelta
        },
      };
      this.renderer.addCanvasToDOM();
      
      // add our hook for watching for if the document is ready
      let isReadyCheck = () => {
        if (document.readyState == "complete") {
          defer(() => {
            that.isReady = true;
            that.events.trigger(events.READY);
          });
          return true
        }
        else return false
      };
      
      if (!isReadyCheck()) {
        document.onreadystatechange = isReadyCheck;
      }
    }
    
    whenReady(fn) {
      if (this.isReady) fn();
      else this.events.on(events.READY, fn);
      return this
    }
    
    time() {
      return null
    }
    
    start(fps = 60) {
      
      // note that fps is constrained by the browser,
      // thus it may be more apt to call it a 'render interval'
      // that said, it does still determine the frameskip threshold,
      let fpms = 1000/fps;
      
      console.log(`Stepping every ${fpms.toFixed(2)}ms, ${fps} frames per second`);
      this.events.trigger(events.START, this.renderer, this);
      this.running = true;
      
      const that = this;
      const now = () => Date.now();
      const start = now();
      
      // if a step takes longer than this we skip the frame
      //    At 60FPS, this would be 12.5ms to process a 'step'
      const frameskipDeltaThreshold = fpms * 0.8;
      
      // our time reference, provided to all renders and steps
      // using a constant reference helps V8's JITC create an optimized class early.
      const time = {
        id:               null,
        now:              start,
        start:            start,
        ticks:            0,
        delta:            null,
        elapsed:          0,
        lastCalled:       start,
        stepDuration:     0,
        lastRenderDelta:  0,
      };
      
      
      let _now = 0;
      let lastRender = start;
      
      this.time = () => time;
      
      // everything in this function is extremely performance-sensitive
      // but, it's also where all the magic happens
      const tick = e => {
        
        time.ticks += 1;
        
        if (!that.running) {
          if (time.id != null) window.cancelAnimationFrame(time.id);
          time.id = null;
          return
        }
        
        that.events.trigger(events.TICK, time);
        
        // update time object with the new time and deltas
        _now = now();
        
        time.now = _now;
        time.delta = (_now - time.lastCalled);
        time.elapsed += time.delta;
        
        // perform a step
        that.events.trigger(events.STEP, time);
        
        // after a step we measure the time it took to determine if too much processing 
        // occurred for an immediate render, a la, frame sklpping
        _now = now();
        time.stepDuration = _now - time.now;
        time.lastRenderDelta = _now - lastRender;
        
        if (time.stepDuration > frameskipDeltaThreshold) {
          
          that.stats.skippedFrames += 1;
          time.elapsed -= time.delta;
          time.lastCalled = _now;
        }
        else {
          
          lastRender = _now;
          that.events.trigger(events.PRERENDER, time, that.renderer, that);
          that.events.trigger(events.RENDER, time, that.renderer, that);
          time.lastCalled = _now;
          that.events.trigger(events.POSTRENDER, time, that.renderer, that);
        }
        
        time.id = window.requestAnimationFrame(tick);
      };
      
      // we ride
      time.id = window.requestAnimationFrame(tick);
      
      return this
    }
    
    stop() {
      this.running = false;
      this.events.trigger(events.STOP, this.renderer, this);
    }
    
  }


  /*
     Amazing things seem to be happening!  
  */
  const suki = new Suki();

  const keyCodes = {
    8:    "backspace",
    9:    "tab",
    13:   "enter",
    16:   "shift",
    17:   "ctrl",
    18:   "alt",
    19:   "pause",
    20:   "caps-lock",
    27:   "escape",
    32:   "space",
    33:   "pageup",
    34:   "pagedown",
    35:   "end",
    36:   "home",
    37:   "left",
    38:   "up",
    39:   "right",
    40:   "down",
    45:   "insert",
    46:   "delete",
    
    // alphabetical chars are here
    
    96:   "numpad-0",
    97:   "numpad-1",
    98:   "numpad-2",
    99:   "numpad-3",
    100:  "numpad-4",
    101:  "numpad-5",
    102:  "numpad-6",
    103:  "numpad-7",
    104:  "numpad-8",
    105:  "numpad-9",
    106:  "numpad-mul",
    107:  "numpad-add",
    109:  "numpad-sub",
    110:  "numpad-dec",
    111:  "numpad-div",
    112:  "f1",
    113:  "f2",
    114:  "f3",
    115:  "f4",
    116:  "f5",
    117:  "f6",
    118:  "f7",
    119:  "f8",
    120:  "f9",
    121:  "f10",
    122:  "f11",
    123:  "f12",
    144:  "num-lock",
    145:  "scroll-lock",
    186:  "semicolon",
    187:  "equal",
    188:  "comma",
    189:  "dash",
    190:  "period",
    191:  "slash",
    192:  "grave-accent",
    219:  "open-bracket",
    220:  "backslash",
    221:  "close-bracket",
    222:  "single-quote",
  };


  class Keyboard {
    
    constructor(element) {
      this.disabled = false;
      this.element = element || document;
      
      // all of our keycodes that aren't alphabetical characters
      this.keyCodes = keyCodes;
      
      // an array of all currently pressed keys
      this.pressed = [];
      this.defaultAllowed = {
        "ctrl": true,
      };
      // a lookup table for if a key is pressed
      this.keys = [];
      
      // bindings
      this.handler = this.handler.bind(this);
    }
    
    clear() {
      this.pressed = [];
      return this
    }
    
    
    capture(element) {
      this.element = element || document;
      this.element.addEventListener("keydown", this.handler);
      this.element.addEventListener("keyup", this.handler);
      return this

    }
    
    release() {
      this.element.addEventListener("keydown", this.handler);
      this.element.addEventListener("keyup", this.handler);
      return this
    }
    
    
    
    handler(e) {
      
      this.pressed = [];
      
      if (this.disabled) return this
      
      let pressed = e.type !== "keyup";
      let char = e.which;
      let key = null;
      
      // alphabetical keys are between 48 and 90
      if (char >= 48 && char <= 90) {
        key = String.fromCharCode(char).toLowerCase();
      }
      else {
        key = this.keyCodes[char];
      }
      
      this.keys[key] = pressed;
      
      if (!this.defaultAllowed[key]) {
        e.stopPropagation();
        e.preventDefault();
      }
      
      // add the pressed keys to our list of pressed keys
      for (let k in this.keys) {
        let value = this.keys[k];
        if (value === true) this.pressed.push(k);
      }
      
      return this
    }
    
    
    // helper method for checking if a set of keys have been pressed
    // Keyboard.command(["ctrl", "x"])
    // @param exact if the pressed keys should match exactly
    //    e.g. ["ctrl", "x"] is pressed, not ["ctrl", "shift", "x"]
    command(keys, exact = false) {
      
      // short-circuit check for exact
      if (exact && (keys.length !== this.pressed.length)) {
        return false
      }
      
      // check if all of our keys are pressed
      // short-circuits on failure
      for (let i = 0, ii = keys.length; i < ii; i++) {
        if (this.keys[keys[i]]) continue
        else return false
      }
      
      return true
    }
    
    any(keys) {
      return this.identity(keys, true)
    }
    
    not(keys) {
      return this.identity(keys, false)
    }
    
    only(keys) {
      return this.command(keys, true)
    }
    
    identity(keys, result) {
      for (let i = 0, ii = keys.length; i < ii; i++) {
        if (this.keys[keys[i]]) return result
      }
      return !result
    }
    
    
  }

  var keyboard = new Keyboard();

  class BulletManager {
    
    constructor() {
      this.bullets = [];
    }
    
    spawnBullet(x, y, isEnemy) {
      
      if (isEnemy) {
        let speed = 10;
        this.bullets.push(new EnemyBullet(x, y, speed));
      }
      else {
        let speed = 20;
        this.bullets.push(new AllyBullet(x, y, -speed));
      }
      
    }
    
    step() {
      
      // moves all bullets, and determines if they're offscreen
      this.bullets = this.bullets.filter( bullet => {
        bullet.step();
        return !bullet.isOffScreen;
      });
      
    }
    
    render($) {
      this.bullets.forEach( bullet => bullet.render($));
    }
  }


  class Bullet {
    
    constructor(x, y, speed, color) {
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.color = color;
      this.isOffScreen = false;
      this.width = 5;
      this.height = 10;
    }
    
    step() {
      this.y += this.speed;
      if (this.y + this.height <= 0) this.isOffScreen = true;
      if (this.y + this.height >= window.innerHeight) this.isOffScreen = true;
    }
    
    render($) {
      $.fillStyle(this.color);
      $.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  class EnemyBullet extends Bullet {
    
    constructor(x, y, speed,) {
      super(x, y, speed, "#fc0");
    }
  }

  class AllyBullet extends Bullet {
    
    constructor(x, y, speed,) {
      super(x, y, speed, "#fff");
    }
  }

  var bulletManager = new BulletManager();

  class Ship {

      constructor(x = 0, y = 0, color = "#0bb") {
        this.width = 15;
        this.height = 30;
        this.x = x;
        this.y = y;
        this.color = color;
      }
      
      step(x, y) {
        this.x = x;
        this.y = y;
      }
      
      move(x = 0, y = 0) {
        this.x += x;
        this.y += y;
      }
      
      shoot() {
        bulletManager.spawnBullet(this.x, this.y - 10, false);
      }
      
      render($) {
          $.fillStyle(this.color);
          $.fillRect(this.x, this.y, this.width, this.height);
          let w = this.width;
          // right wing
          $.fillRect(this.x + w, this.y + w + 2, w, w);
          // lfet wing
          $.fillRect(this.x - w, this.y + w + 2, w, w);
      }
      
  }

  const ship = new Ship(window.innerWidth / 2, window.innerHeight / 2);

  suki.whenReady(() => {
      suki.start();
      keyboard.capture();
  });


  suki.events.on(events.STEP, (time, $) => {
      
      let shipMovement = 5;
      
      switch (keyboard.pressed[0]) {
        case "left":  ship.move(-shipMovement, 0); break;
        case "right": ship.move( shipMovement, 0); break;
        case "up":    ship.move(0, -shipMovement); break;
        case "down":  ship.move(0,  shipMovement); break;
      }
      
      bulletManager.step();
      
      if (keyboard.any(["space"])) {
          ship.shoot();
      }
  });

  suki.events.on(events.RENDER, (time, $) => {
    $.clear("#266");
    bulletManager.render($);
    ship.render($);
  });

}());
