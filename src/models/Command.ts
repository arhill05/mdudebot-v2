import { Collection, Interaction, SlashCommandBuilder } from "discord.js";
import Session from "../services/Session";

export interface Command {
  command: SlashCommandBuilder;
  execute(
    interaction: Interaction,
    sessions: Collection<string, Session>
  ): Promise<void>;
}
