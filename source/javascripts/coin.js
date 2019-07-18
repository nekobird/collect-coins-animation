import Util from './util';
import Vector2 from './vector2';
import Animation from './animation';

// @Coin
var COIN_DEFAULT_CONFIG = {
  // Animation
  delay: 1000,
  duration: 1000,
  timingFunction: function(t) { return t * t * t; },

  // Vectors
  startVector: new Vector2(),
  endVector: new Vector2(),

  // 0 -> 1
  curveStartIntensity: 0.5,
  curveEndIntensity: 0.5,

  curveStartAngle: 0,
  curveEndAngle: 0,

  beforeStart: function() {},
  onComplete: function() {},
};

var Coin = function(config) {
  this.init(config);
};

Coin.prototype = {
  // 1) Initialize properties and set config.
  init: function(config) {
    this.config = Util.objectAssign({}, COIN_DEFAULT_CONFIG);
    this.setConfig(config);

    this.animation = new Animation();
    this.isActive = false;

    this.amount = this.config.amount;
    this.position = new Vector2().equals(this.config.startVector);
    this.controlPoint1 = this.getControlPointVector(this.config.startVector, this.config.endVector,   this.config.curveStartIntensity, this.config.curveStartAngle);
    this.controlPoint2 = this.getControlPointVector(this.config.endVector,   this.config.startVector, this.config.curveEndIntensity,   this.config.curveEndAngle);
  },
  // 2) Set coin config.
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  // 3) Helper function to calculate control point vectors.
  getControlPointVector: function(from, to, intensity, angleOffset) {
    var distance = from.getDistanceTo(to);
    var length = distance * intensity;
    var angle = Util.cycleNumber(
      from.getAngleTo(to) + angleOffset, Math.PI * 2
    );
    return new Vector2(
      from.x + Math.cos(angle) * length,
      from.y + Math.sin(angle) * length,
    );
  },
  // 4) Start here.
  start: function() {
    this.animation.stop();
    this.animation.setConfig({
      delay: this.config.delay,
      duration: this.config.duration,
      timingFunction: this.config.timingFunction,
      onStart: function() {
        this.config.beforeStart(this);
        this.isActive = true;
      }.bind(this),
      onTick: this.tick.bind(this),
      onComplete: this.end.bind(this),
    });
    this.animation.play();
  },
  // 5)
  tick: function(t) {
    this.position.applyCubicBezier(t, this.config.startVector, this.controlPoint1, this.controlPoint2, this.config.endVector);
  },
  // 6) This is called once animation is completed.
  end: function() {
    this.isActive = false;
    this.config.onComplete(this);
  },
}

export default Coin;
