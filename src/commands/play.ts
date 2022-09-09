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
    initialInteraction: ChatInputCommandInteraction,
    voiceConnectionManager
  ) => {
    await initialInteraction.deferReply();
    if (!initialInteraction.guildId || !initialInteraction.member) {
      return;
    }

    const voiceChannel = (initialInteraction.member as GuildMember).voice
      .channel as VoiceChannel;

    const soundName = initialInteraction.options.getString("name") as string;

    const volume = initialInteraction.options.getNumber("volume");

    const playAgainButtonId = `play-${soundName.replaceAll(" ", "")}-again`;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(playAgainButtonId)
        .setLabel("Play again")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("stop")
        .setLabel("Stop")
        .setStyle(ButtonStyle.Danger)
    );

    const initialMessage = await initialInteraction.fetchReply();
    const playAgainButtonCollector =
      initialInteraction.channel?.createMessageComponentCollector({
        filter: (i) => i.customId === playAgainButtonId,
        message: initialMessage,
      });

    playAgainButtonCollector?.on("collect", async (i) => {
      await playSound(voiceChannel, voiceConnectionManager, soundName, volume);
      await i.reply({
        content: `Playing '${soundName}' again...`,
      });
      await i.deleteReply();
    });

    const stopButtonCollector =
      initialInteraction.channel?.createMessageComponentCollector({
        filter: (i) => i.customId === "stop",
        message: initialMessage,
      });

    stopButtonCollector?.on("collect", async (i) => {
      await voiceConnectionManager.disconnectAllConnections();
      i.reply({ content: `Stopping '${soundName}'` });
      i.deleteReply();
    });

    await playSound(voiceChannel, voiceConnectionManager, soundName, volume);

    await initialInteraction.editReply({
      content: `Playing ${soundName}!`,
      components: [row],
    });
  },
};

export default play;
