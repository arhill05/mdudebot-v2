import { Interaction, SlashCommandBuilder } from "discord.js";

export interface Command {
  command: SlashCommandBuilder;
  execute(interaction: Interaction): Promise<void>;
}
