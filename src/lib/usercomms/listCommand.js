import ackInteraction from "../../util/ackInteraction.js";
import { usergameDB } from "./commandDB.js";
import {
    editOriginalInteractionResponse,
} from "../../../deps.js";

function makeComponents(page) {
    return [
	{
	    type: 1,
	    components: [
		{
		    type: 2,
		    label: "Prev",
		    style: 1,
		    customId: `prg_prev${page}`,
		    disabled: page==1
		},
		{
		    type: 2,
		    label: `${page}`,
		    style: 2,
		    customId: "prg_page",
		    disabled: true
		},
		{
		    type: 2,
		    label: "Next",
		    style: 1,
		    customId: `prg_next${page}`
		}
	    ]
	}
    ]
}

function prgList(page) {
    const fields = [];
    const commands = usergameDB.searchCommand();
    for (const command of commands.slice((page-1)*10,page*10)) {
	fields.push({
	    name: command[2],
	    value: `Made by: <@${command[1]}>`
	});
    }
    if (fields.length == 0)
	return undefined;
    return fields;
}

export function listCommand(bot, interaction) {
    let page = 1;

    if (interaction.data.customId) {
	const action = interaction.data.customId;
	page = parseInt(action.match(/[\d]+/));
	if (action.startsWith("prg_prev"))
	    page -=1;
	else if (action.startsWith("prg_next"))
	    page +=1;
	ackInteraction(interaction, "deferred", {ephemeral: true});
    }else {
	ackInteraction(interaction, "thinking", {ephemeral: true});
    }

    const fields = prgList(page);

    bot.logger.debug(`${JSON.stringify(fields)}`);
    
    editOriginalInteractionResponse(bot, interaction.token, {
	customId: `${page}`,
	embeds: [
	    {
		title: "Log Preview",
		fields: fields
	    }
	],
	components: makeComponents(page)
    });
}
