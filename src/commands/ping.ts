import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../models/Command";

export const ping: Command = {
  command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }
    await interaction.reply("pong!");
  },
};

export default ping;
