import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../models/Command";

export const stop: Command = {
  command: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops all sounds"),
  execute: async (
    interaction: ChatInputCommandInteraction,
    voiceConnectionManager
  ) => {
    await interaction.deferReply();

    if (!interaction.guildId) {
      return;
    }
    if (!interaction.member) {
      return;
    }

    await voiceConnectionManager.disconnectAllConnections();

    await interaction.editReply({
      content: "Stopped!",
    });
  },
};

export default stop;
