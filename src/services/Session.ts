import {
  AudioPlayer,
  AudioPlayerIdleState,
  AudioPlayerPlayingState,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  entersState,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { GuildChannel } from "discord.js";
import fetchYouTubeVideo from "../utils/youTubeVideoFetcher";

export default class Session {
  private readonly player: AudioPlayer;
  private readonly connection: VoiceConnection;
  private readonly sessionStopCallback: undefined | (() => void);
  constructor(guildChannel: GuildChannel, sessionStopCallback?: () => void) {
    this.sessionStopCallback = sessionStopCallback;
    this.player = createAudioPlayer({
      debug: true,
      behaviors: { noSubscriber: NoSubscriberBehavior.Stop },
    });

    this.connection = joinVoiceChannel({
      channelId: guildChannel.id,
      guildId: guildChannel.guildId,
      adapterCreator: guildChannel.guild.voiceAdapterCreator,
    });

    entersState(this.connection, VoiceConnectionStatus.Ready, 30_000).then(
      () => {
        this.connection.subscribe(this.player);
      }
    );

    this.player.on("error", console.error);
    this.connection.on("error", console.error);
    this.connection.on("debug", console.info);
    this.player.on("stateChange", (oldState, newState) => {
      if (
        oldState.status === AudioPlayerStatus.Playing &&
        newState.status === AudioPlayerStatus.Idle
      ) {
        this.stop();
      }
    });
  }

  async start(stream: AudioResource) {
    this.player.play(stream);
  }

  stop() {
    this.player.stop(true);
    this.connection.disconnect();
    this.connection.destroy();
    if (this.sessionStopCallback) {
      this.sessionStopCallback();
    }
  }
}
