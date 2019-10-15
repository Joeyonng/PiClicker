const chalk = require("chalk");
const express = require("express");
const cors = require("cors");

const app = express();
const http = require("http");
const httpServer = http.createServer(app);
const io = require("socket.io");
const ioserver = io(httpServer);

const { logRequest, logResponse } = require("./express-logger");

ioserver.on("connection", socket => {
  if (socket.handshake.query.connectionType === "d") {
    socket.on("sessionActivated", data => {
      console.log(
        chalk.bgMagenta("Session Activated With Data:", JSON.stringify(data))
      );
      ioserver.sockets.emit("sessionActivated", data);
    });

    socket.on("sessionDeactivated", () => {
      console.log(chalk.bgMagenta("Session Deactivated"));
      ioserver.sockets.emit("sessionDeactivated");
    });

    socket.on("pollActivated", data => {
      console.log(
        chalk.bgMagenta("Poll Activated With Data", JSON.stringify(data))
      );
      ioserver.sockets.emit("pollActivated", data);
    });

    socket.on("pollDeactivated", () => {
      console.log(chalk.bgMagenta("Poll Deactivated"));
      ioserver.sockets.emit("pollDeactivated");
    });

    socket.on("voteLogged", data => {
      console.log(
        chalk.bgMagenta("Vote Logged With Data", JSON.stringify(data))
      );
      ioserver.sockets.emit("voteLogged", data);
    });
  }
});

const accountRouter = require("./routers/account_router");
const activityChangerRouter = require("./routers/activity_changer_router");
const courseCategoryRouter = require("./routers/category_router");
const courseCodeRouter = require("./routers/course_code_router");
const getterRouter = require("./routers/getter_router");
const mainDataRouter = require("./routers/main_data_router");
const resetDatabaseRouter = require("./routers/reset_database_router");
const studentRouter = require("./routers/student_router");
const piclickerUSBRouter = require("./routers/piclickerUSB_router");

app.use(cors());
app.use(express.json());

app.use("/", logRequest);

app.use("/account", accountRouter);
app.use("/activity", activityChangerRouter);
app.use("/categories", courseCategoryRouter);
app.use("/codes", courseCodeRouter);
app.use("/getters", getterRouter);
app.use("/main", mainDataRouter);
app.use("/reset", resetDatabaseRouter);
app.use("/student", studentRouter);
app.use("/piclickerUSB", piclickerUSBRouter);

module.exports = httpServer;
