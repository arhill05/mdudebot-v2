import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  GatewayIntentBits,
} from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

import commands from "./commands";
import { Command } from "./models/Command";

console.log("Bot is starting...");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commandsCollection = new Collection();
commands.forEach((command) =>
  commandsCollection.set(command.command.name, command)
);

const start = async () => {
  client.once("ready", () => {
    console.log("Bot is ready!");
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }
    const command = commandsCollection.get(interaction.commandName) as Command;
    if (!command) {
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      await interaction.reply({ content: "error!", ephemeral: true });
    }
  });

  await client.login(process.env.BOT_TOKEN);
};

start();
