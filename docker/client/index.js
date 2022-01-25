require("dotenv").config();

const mineflayer = require("mineflayer");
const {
  pathfinder,
  Movements,
  goals: { GoalNear },
} = requrie("mineflayer-pathfinder");

const bot = mineflayer.createBot({
  host: process.env.HOST,
  port: process.env.PORT,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
});

bot.once("spawn", () => {
  const mcData = require("minecraft-data")(bot.version);
  const defaultMove = new Movements(bot, mcData);

  bot.on("inject_allowed", () => {
    bot.loadPlugin(pathfinder);
  });

  bot.on("chat", (username, message) => {
    if (username === bot.username) return;

    if (message === "come") {
      const target = bot.players[username]?.entity;

      if (!target) return bot.chat("don't see you bozo");

      const { x: playerX, y: playerY, z: playerZ } = target.position;

      bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 1));
    }

    if (message === "harvest-pumpkins") {
      let pumpkins = bot.findBlocks({
        matching: mcData.blocksByName.pumpkin.id,
        point: bot.entity.position,
        maxDistance: 24,
      });

      for (let pumpkin of pumpkins) {
        bot.pathfinder.setGoal(
          new GoalNear(pumpkin.x, pumpkin.y, pumpkin.z, 1)
        );
      }
    }
  });
});
