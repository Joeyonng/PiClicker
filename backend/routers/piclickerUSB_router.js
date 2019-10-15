const { Router } = require("express");
const shell = require("shelljs");

let PiClickerUSBRouter = new Router();

PiClickerUSBRouter.post("/openPiClickerWindow", (req, res) => {
  // shell.exec("python3 ../python/openPiClickerWindow.py", { async: true });
});

PiClickerUSBRouter.post("/closePiClickerWindow", (req, res) => {
  // shell.exec("python3 ../python/closePiClickerWindow.py", { async: true });
});

PiClickerUSBRouter.post("/takePiClickerScreenshot", (req, res) => {
  // shell.exec("python3 ../python/takePiClickerScreenshot.py");
});

PiClickerUSBRouter.post("/changeAPCreds", (req, res) => {
  // let params = req.body;
});

PiClickerUSBRouter.post("/changeAPChannel", (req, res) => {
  //aaa
});

PiClickerUSBRouter.post("/switchToHID", (req, res) => {
  // shell.exec("../python/switchToHID");
});

PiClickerUSBRouter.post("/switchToGEther", (req, res) => {
  // shell.exec("../python/switchToGEther");
});

PiClickerUSBRouter.post("/shutdown", (req, res) => {
  // shell.exec("shutdown now");
});

module.exports = PiClickerUSBRouter;
