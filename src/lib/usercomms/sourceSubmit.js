import ackInteraction from "../../util/ackInteraction.js";
import {
} from "../../../deps.js";
import { usergameDB } from "./commandDB.js";

export function sourceCommand(bot, interaction) {
    const sourceData = interaction.data;
    const sourceId = sourceData.customId;
    const userId = sourceId.split('_')[1];
    const commandComponent = sourceData.components[0].components[0]
    const commandName = commandComponent.customId;
    const commandSource = commandComponent.value;
    bot.logger.debug(`Interaction Data: ${JSON.stringify(sourceData)}`);

    if (sourceId.endsWith("create")) {
	const success = usergameDB.createCommand(
	    `${userId}`,
	    commandName,
	    commandSource
	);
	if (success) {
	    ackInteraction(interaction, "message", {ephemeral: true}, {
		content: `Created Command "${commandName}":\`\`\`${commandSource.slice(0,1500)}\`\`\``
	    });
	}else {
	    ackInteraction(interaction, "message", {ephemeral: true}, {
		content: `Failed to Create Command ${commandName}`
	    });
	}
    }else if (sourceId.endsWith("update")) {
	const success = usergameDB.updateCommand(
	    `${userId}`,
	    commandName,
	    commandSource
	);
	if (success) {
	    ackInteraction(interaction, "message", {ephemeral: true}, {
		content: `Updated Command "${commandName}" to:\`\`\`${commandSource.slice(0,1500)}\`\`\``
	    });
	}else {
	    ackInteraction(interaction, "message", {ephemeral: true}, {
		content: `Failed to Create Command ${commandName}`
	    });
	}
    }

    return
}
