import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client,
  VoiceChannel,
  GuildMember,
  Collection,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
} from "discord.js";
import { Command } from "../models/Command";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  StreamType,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import Session from "../services/Session";
import fetchYouTubeVideo from "../utils/youTubeVideoFetcher";
import VoiceConnectionManager from "../services/VoiceConnectionManager";
export const yt: Command = {
  command: new SlashCommandBuilder()
    .setName("yt")
    .addStringOption((option) =>
      option
        .setName("video-url")
        .setDescription("The URL of the video to play")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("volume")
        .setDescription("The volume to play the sound at")
        .setMaxValue(100)
        .setMinValue(0)
    )
    .setDescription("Plays a video from YouTube given a url"),
  execute: async (
    interaction: ChatInputCommandInteraction,
    voiceConnectionManager: VoiceConnectionManager
  ) => {
    if (!interaction.guildId || !interaction.member) {
      return;
    }

    const voiceChannel = (interaction.member as GuildMember).voice
      .channel as VoiceChannel;

    await playSound(voiceChannel, interaction, voiceConnectionManager);
  },
};

async function playSound(
  voiceChannel: VoiceChannel,
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  voiceConnectionManager: VoiceConnectionManager
) {
  await interaction.deferReply();

  const url = (interaction as ChatInputCommandInteraction).options.getString(
    "video-url"
  ) as string;
  const youtubeVideo = await fetchYouTubeVideo(url as string);

  const volume = (interaction as ChatInputCommandInteraction).options.getNumber(
    "volume"
  );

  if (volume !== null) {
    youtubeVideo.stream.volume?.setVolume(volume);
  }

  await voiceConnectionManager.tryConnectToChannel(voiceChannel);
  await voiceConnectionManager.playSound(youtubeVideo.stream);

  await interaction.editReply(
    `Playing ${youtubeVideo.name} - Length: ${youtubeVideo.duration}s - Link: ${youtubeVideo.link}`
  );
}

export default yt;
