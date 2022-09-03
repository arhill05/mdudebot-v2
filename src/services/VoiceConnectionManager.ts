import {
  AudioPlayer,
  AudioPlayerState,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  entersState,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionState,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { VoiceChannel } from "discord.js";

export default class VoiceConnectionManager {
  connection: VoiceConnection | null = null;
  private readonly player: AudioPlayer;
  private isCurrentlyConnected = false;
  constructor() {
    this.player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Stop },
    });

    this.player.on("error", console.error);
    this.player.on("stateChange", this.onAudioPlayerStateChange);
  }

  tryConnectToChannel = async (voiceChannel: VoiceChannel) => {
    if (this.isCurrentlyConnected) {
      return;
    }

    if (!this.connection) {
      this.connection = await joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);
      this.connection.subscribe(this.player);
      this.connection.on("error", console.error);
      this.connection.on("debug", console.info);
      this.connection.on(
        "stateChange",
        this.logVoiceConnectionStateChangeToConsole
      );
    }

    this.isCurrentlyConnected = true;
  };

  disconnectAllConnections = async () => {
    this.player.stop(true);
    this.connection?.disconnect();
    this.connection = null;
    this.isCurrentlyConnected = false;
  };

  playSound = async (audioResource: AudioResource) => {
    if (!this.isCurrentlyConnected) {
      throw new Error("Not currently connected");
    }

    this.player.play(audioResource);
  };

  private onAudioPlayerStateChange = (
    oldState: AudioPlayerState,
    newState: AudioPlayerState
  ) => {
    this.logAudioPlayerStateChangeToConsole(oldState, newState);

    if (
      oldState.status === AudioPlayerStatus.Playing &&
      newState.status === AudioPlayerStatus.Idle
    ) {
      this.disconnectAllConnections();
    }
  };

  private logAudioPlayerStateChangeToConsole = (
    oldState: AudioPlayerState,
    newState: AudioPlayerState
  ) => {
    console.log(
      `${new Date().toISOString()}: AudioPlayer:${oldState.status}->${
        newState.status
      }`
    );
  };

  private logVoiceConnectionStateChangeToConsole = (
    oldState: VoiceConnectionState,
    newState: VoiceConnectionState
  ) => {
    console.log(
      `${new Date().toISOString()}: VoiceConnection:${oldState.status}->${
        newState.status
      }`
    );
  };
}
