import { Collection, Interaction, SlashCommandBuilder } from "discord.js";
import Session from "../services/Session";
import VoiceConnectionManager from "../services/VoiceConnectionManager";

export interface Command {
  command: SlashCommandBuilder;
  execute(
    interaction: Interaction,
    voiceConnectionManager: VoiceConnectionManager
  ): Promise<void>;
}
