import { joinVoiceChannel } from "@discordjs/voice";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  VoiceChannel,
} from "discord.js";
import Session from "../services/Session";
import { Command } from "../models/Command";

export const ping: Command = {
  command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  execute: async (interaction: ChatInputCommandInteraction, sessions) => {
    await interaction.deferReply();

    if (!interaction.guildId) {
      return;
    }
    if (!interaction.member) {
      return;
    }

    const voiceChannel = (interaction.member as GuildMember).voice
      .channel as VoiceChannel;

    const sessionKey = interaction.guildId;

    let session = sessions.get(sessionKey);

    if (!session) {
      sessions.set(sessionKey, new Session(voiceChannel));
      session = sessions.get(sessionKey);
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("leave-channel")
        .setLabel("Leave")
        .setStyle(ButtonStyle.Primary)
    );

    const leaveChannelButtonCollector =
      interaction.channel?.createMessageComponentCollector({
        filter: (i) => i.customId === "leave-channel",
      });

    leaveChannelButtonCollector?.on("collect", async (i) => {
      session?.stop();
      i.update({ content: "I'm no longer in your channel!", components: [] });
      leaveChannelButtonCollector.dispose(i);
    });

    await interaction.editReply({
      content: "I'm in your channel!",
      components: [row],
    });
  },
};

export default ping;
