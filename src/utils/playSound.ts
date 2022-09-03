import {
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
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
import { createReadStream } from "fs";
import path from "path";
const SOUNDS_PATH = path.resolve(__dirname, "../sounds");

import VoiceConnectionManager from "../services/VoiceConnectionManager";

export async function playSound(
  voiceChannel: VoiceChannel,
  voiceConnectionManager: VoiceConnectionManager,
  soundName: string,
  volume: number | null
) {
  const audioResource = createAudioResource(
    createReadStream(`${SOUNDS_PATH}/${soundName}.mp3`),
    { inlineVolume: true }
  );
  if (volume !== null) {
    audioResource.volume?.setVolume(volume);
  }
  await voiceConnectionManager.tryConnectToChannel(voiceChannel);
  await voiceConnectionManager.playSound(audioResource);
}

export default playSound;
