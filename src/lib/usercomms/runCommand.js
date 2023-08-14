import ackInteraction from "../../util/ackInteraction.js";
import {
    InteractionTypes,
} from "../../../deps.js";
import { usergameDB } from "./commandDB.js";

export async function runCommand(bot, interaction) {
    const sourceData = interaction.data;

    let input;
    let hidden = false;
    let commandId;

    switch(interaction.type) {
	case InteractionTypes.ModalSubmit: {
	    const commandComponent = sourceData.components[0].components[0];
	    commandId = commandComponent.value;
	    const inputComponent = sourceData.components[1].components[0];
	    input = inputComponent.value;
	    break;
	}
	case InteractionTypes.ApplicationCommand: {
	    const createOptions = interaction.data.options.filter(
		o => o.name == "run"
	    )[0].options;

	    commandId = createOptions.filter(
		o => o.name == "command"
	    )[0]["value"];

	    const inputMaybe = createOptions.filter(
		o => o.name == "input"
	    );

	    if (inputMaybe.length == 1) {
		input = inputMaybe[0]["value"];
	    }

	    const hiddenMaybe = createOptions.filter(
		o => o.name == "hidden"
	    );

	    if (hiddenMaybe.length == 1) {
		hidden = hiddenMaybe[0]["value"];
	    }
	}
    }

    bot.logger.debug(`Running command ${commandId}`);

    const exists = usergameDB.searchCommand({name: commandId})

    if (exists.length == 0) {
	ackInteraction(
	    interaction,
	    "message",
	    {ephemeral: true},
	    {
		content: `Command with name ${commandId} does not exist!`
	    }
	);
    }else {
	ackInteraction(
	    interaction,
	    "thinking",
	    {ephemeral: hidden}
	);
	const output = await usergameDB.runCommand(commandId, input);
	bot.logger.debug(`Command output:\n ${JSON.stringify(output)}`)
	const msg = await bot.helpers.editOriginalInteractionResponse(interaction.token, output);
	bot.logger.debug(`Message:\n${JSON.stringify(msg)}`);
    }
    return
}
