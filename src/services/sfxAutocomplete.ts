import { AutocompleteInteraction } from "discord.js";
import { getAvailableSounds } from "../utils/soundsUtils";

const onPlayAutocompleteInteraction = async (
  interaction: AutocompleteInteraction
) => {
  const focusedValue = interaction.options.getFocused();
  const choices = await getAvailableSounds();
  const filtered = (await choices)
    .filter(
      (choice) =>
        choice.startsWith(focusedValue) ||
        choice.toLowerCase() === focusedValue.toLowerCase()
    )
    .slice(0, 25);
  await interaction.respond(
    filtered.map((choice) => ({ name: choice, value: choice }))
  );
};

export default onPlayAutocompleteInteraction;
