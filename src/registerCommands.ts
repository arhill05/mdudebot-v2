import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";
import commands from "./commands";
import * as dotenv from "dotenv";
dotenv.config();


const commandsJson = [...commands].map((command) => command.command.toJSON());

const { BOT_TOKEN, MDUDE_SERVER_GUILD_ID, BOT_CLIENT_ID } = process.env;

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN as string);

const work = async () => {
  try {
    const result: any = await rest.put(
      Routes.applicationGuildCommands(
        BOT_CLIENT_ID as string,
        MDUDE_SERVER_GUILD_ID as string
      ),
      { body: commandsJson }
    );

    console.log(
      `Successfully registered ${result.length} application commands`
    );
  } catch (err) {
    console.error(err);
  }
};

work();
