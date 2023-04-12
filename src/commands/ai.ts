import { createAudioResource } from "@discordjs/voice";
import { randomUUID } from "crypto";
import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  VoiceChannel,
} from "discord.js";
import * as fs from "fs/promises";
import path from "path";
import { Command } from "../models/Command";
import getAudioStreamForText from "../utils/elevenLabs";

export const ai: Command = {
  command: new SlashCommandBuilder()
    .setName("ai-voice-drew")
    .addStringOption((option) =>
      option.setName("text").setRequired(true).setDescription("Text to play")
    )
    .setDescription("Play some text using Drew's voice"),
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

    const text = initialInteraction.options.getString("text") as string;

    const audioStream = await getAudioStreamForText(text);

    const fileName = `ai-${randomUUID()}`;

    const soundPath = `${path.resolve(__dirname, "../sounds")}/${fileName}.mp3`;

    await fs.writeFile(soundPath, audioStream);
    const audioResource = createAudioResource(soundPath);
    await voiceConnectionManager.tryConnectToChannel(voiceChannel);
    await voiceConnectionManager.playSound(audioResource);

    await fs.unlink(soundPath);

    await initialInteraction.editReply({
      content: `Playing ${text} as Drew!`,
    });
  },
};

export default ai;
