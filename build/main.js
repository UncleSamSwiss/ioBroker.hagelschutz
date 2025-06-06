"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
class Hagelschutz extends utils.Adapter {
  checkInterval;
  constructor(options = {}) {
    super({
      ...options,
      name: "hagelschutz"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    this.setState("info.connection", false, true);
    this.log.info("config deviceID: " + this.config.deviceID);
    this.log.info("config hwtypeld: " + this.config.hwtypeld);
    this.checkInterval = this.setInterval(() => void this.checkHailStatus(), 120 * 1e3);
    void this.checkHailStatus();
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
      this.clearInterval(this.checkInterval);
      callback();
    } catch (e) {
      callback();
    }
  }
  async checkHailStatus() {
    try {
      this.log.debug("Checking hail status...");
      const response = await fetch(
        `https://meteo.netitservices.com/api/v1/devices/${encodeURIComponent(this.config.deviceID)}/poll?hwtypeId=${encodeURIComponent(this.config.hwtypeld)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.currentState === void 0 || typeof data.currentState !== "number") {
        throw new Error(
          "Invalid response format: currentState is missing or not a number: " + JSON.stringify(data)
        );
      }
      await this.setState("info.connection", true, true);
      await this.setState("currentState", data.currentState, true);
      this.log.debug("Hail status set to " + data.currentState);
    } catch (error) {
      this.log.warn("Error checking hail status: " + error);
      await this.setState("info.connection", false, true);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Hagelschutz(options);
} else {
  (() => new Hagelschutz())();
}
//# sourceMappingURL=main.js.map
