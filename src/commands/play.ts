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
    .setDescription("Plays a sound effect"),
  execute: async (interaction: ChatInputCommandInteraction, sessions) => {
    if (!interaction.guildId) {
      return;
    }
    if (!interaction.member) {
      return;
    }

    const voiceChannel = (interaction.member as GuildMember).voice
      .channel as VoiceChannel;

    const soundName = interaction.options.getString(
      "name"
    ) as string;

    const audioResource = createAudioResource(
      `${SOUNDS_PATH}/${soundName}.mp3`
    );

    await playSound(voiceChannel, interaction, audioResource);
  },
};

export default play;
