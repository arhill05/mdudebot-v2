import {
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  entersState,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  VoiceChannel,
} from "discord.js";

export async function playSound(
  voiceChannel: VoiceChannel,
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  audioResource: AudioResource
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

  player.on("error", console.error);
  connection.on("error", console.error);
  connection.on("debug", console.info);
  player.on("stateChange", async (oldState, newState) => {
    if (
      oldState.status === AudioPlayerStatus.Playing &&
      newState.status === AudioPlayerStatus.Idle
    ) {
      // todo: allow multiple sequential commands
      connection.disconnect();
    }
  });

  await player.play(audioResource);
  await interaction.editReply(`Playing!`);
}

export default playSound;
