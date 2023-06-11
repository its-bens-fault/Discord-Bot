import {
    InteractionTypes,
} from "../../../deps.js";

import { createCommand } from "../../lib/usercomms/createCommand.js";
import { updateCommand } from "../../lib/usercomms/updateCommand.js";

const subcommands = {
    "create": createCommand,
    "update": updateCommand,
};

export function masterAction(bot, interaction) {
    const data = interaction.data;

    switch(interaction.type) {
	case InteractionTypes.ApplicationCommand: {
	    if (!data.options)
		return;
	    for (const option of data.options) {
		if (option.name in subcommands) {
		    subcommands[option.name](bot, interaction);
		    break;
		}
	    }
	    break;
	} default: {
	    return;
	}
    }
}
