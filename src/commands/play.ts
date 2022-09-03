import { createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  VoiceChannel,
} from "discord.js";
import { Command } from "../models/Command";
import path from "path";
import playSound from "../utils/playSound";
import { setTimeout } from "timers/promises";
const SOUNDS_PATH = path.resolve(__dirname, "../sounds");

export const play: Command = {
  command: new SlashCommandBuilder()
    .setName("play")
    .addStringOption((option) =>
      option
        .setName("name")
        .setRequired(true)
        .setDescription("The name of the sound effect to play")
        .setAutocomplete(true)
    )
    .addNumberOption((option) =>
      option
        .setName("volume")
        .setDescription("The volume to play the sound at")
        .setMaxValue(100)
        .setMinValue(0)
    )
    .setDescription("Plays a sound effect"),
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

    const voiceChannel = (interaction.member as GuildMember).voice
      .channel as VoiceChannel;

    const soundName = interaction.options.getString("name") as string;

    const volume = interaction.options.getNumber("volume");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("play-again")
        .setLabel("Play again")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("stop")
        .setLabel("Stop")
        .setStyle(ButtonStyle.Danger)
    );

    const playAgainButtonCollector =
      interaction.channel?.createMessageComponentCollector({
        filter: (i) => i.customId === "play-again",
      });

    playAgainButtonCollector?.on("collect", async (i) => {
      await playSound(voiceChannel, voiceConnectionManager, soundName, volume);
      i.reply({ content: `Playing '${soundName}' again...` });
      await setTimeout(1000);
      i.deleteReply();
    });

    const stopButtonCollector =
      interaction.channel?.createMessageComponentCollector({
        filter: (i) => i.customId === "stop",
      });

    stopButtonCollector?.on("collect", async (i) => {
      await voiceConnectionManager.disconnectAllConnections();
      i.reply({ content: `Stopping '${soundName}'` });
      await setTimeout(1000);
      i.deleteReply();
    });

    await playSound(voiceChannel, voiceConnectionManager, soundName, volume);

    await interaction.editReply({
      content: `Playing ${soundName}!`,
      components: [row],
    });
  },
};

export default play;
