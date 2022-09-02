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
export const yt: Command = {
  command: new SlashCommandBuilder()
    .setName("yt")
    .addStringOption((option) =>
      option
        .setName("video-url")
        .setDescription("The URL of the video to play")
        .setRequired(true)
    )
    .setDescription("Plays a video from YouTube given a url"),
  execute: async (interaction: ChatInputCommandInteraction, sessions) => {
    if (!interaction.guildId || !interaction.member) {
      return;
    }

    const voiceChannel = (interaction.member as GuildMember).voice
      .channel as VoiceChannel;

    await playSound(voiceChannel, interaction);
  },
};

async function playSound(
  voiceChannel: VoiceChannel,
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  videoUrl?: string
) {
  await interaction.deferReply();
  const player = createAudioPlayer({
    debug: true,
    behaviors: { noSubscriber: NoSubscriberBehavior.Stop },
  });

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guildId,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 30000);
  connection.subscribe(player);

  const url =
    videoUrl ??
    ((interaction as ChatInputCommandInteraction).options.getString(
      "video-url"
    ) as string);
  const youtubeVideo = await fetchYouTubeVideo(url as string);

  player.on("error", console.error);
  connection.on("error", console.error);
  connection.on("debug", console.info);
  player.on("stateChange", async (oldState, newState) => {
    if (
      oldState.status === AudioPlayerStatus.Playing &&
      newState.status === AudioPlayerStatus.Idle
    ) {
      connection.destroy();
      await playerDoneCallback(interaction, voiceChannel, url);
    }
  });

  await player.play(youtubeVideo.stream);
  await interaction.editReply(
    `Playing ${youtubeVideo.name} - Length: ${youtubeVideo.duration}s - Link: ${youtubeVideo.link}`
  );
}

async function playerDoneCallback(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  voiceChannel: VoiceChannel,
  videoUrl: string
) {
  // todo: implement play again button
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("play-again")
      .setLabel("Play again")
      .setStyle(ButtonStyle.Primary)
  );
  const playAgainButtonCollector =
    interaction.channel?.createMessageComponentCollector({
      filter: (i) => i.customId === "play-again",
    });

  playAgainButtonCollector?.on("collect", async function (buttonInteraction) {
    playSound(voiceChannel, buttonInteraction as ButtonInteraction, videoUrl);
    playAgainButtonCollector.dispose(buttonInteraction);
  });
  await interaction.editReply({ content: "Done playing", components: [] });
}

export default yt;
