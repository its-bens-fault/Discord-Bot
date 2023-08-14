import { bot } from "../../bot.js";
import { addBotCommand } from "../lib/commands.js";
import ackInteraction from "../util/ackInteraction.js";
import {
    ApplicationCommandOptionTypes,
    editOriginalInteractionResponse,
} from "../../deps.js";

function makeComponents(page) {
    return [
	{
	    type: 1,
	    components: [
		{
		    type: 2,
		    label: "Prev",
		    style: 1,
		    customId: `log_prev${page}`,
		    disabled: page==1
		},
		{
		    type: 2,
		    label: `${page}`,
		    style: 2,
		    customId: "log_page",
		    disabled: true
		},
		{
		    type: 2,
		    label: "Next",
		    style: 1,
		    customId: `log_next${page}`
		}
	    ]
	}
    ]
}

function logHist(page) {
    const rows = bot.logger.db.query(
	`SELECT level,date,msg,_id FROM logs ORDER BY date DESC LIMIT 10 OFFSET ${(page-1)*10}`
    );
    let msg = '';
    for (const row of rows.reverse()) {
	let date = new Date(row[1]);
	date = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
	msg += `[${row[3]}] \u001b[3${Math.floor(row[0]/10)}m${date} ${row[2].slice(0,100)}\n\n`;
    }
    return msg;
}

function logByID(id) {
    const row = bot.logger.db.query(
	`SELECT msg FROM logs WHERE _id = ${id}`
    )[0];
    return row;
}

function logGet(bot, interaction) {
    const options = interaction.data.options;
    let page = 1;
    let id = null;
    if (interaction.data.customId) {
	const action = interaction.data.customId;
	page = parseInt(action.match(/[\d]+/));
	if (action.startsWith("log_prev"))
	    page -=1;
	else if (action.startsWith("log_next"))
	    page +=1;
	ackInteraction(interaction, "deferred", {ephemeral: true});
    }else {
	ackInteraction(interaction, "thinking", {ephemeral: true});
	id = options?.filter(
	    (option) => option.name == "id"
	)[0]?.value;
    }

    let msg = '';

    if (!id) {
	msg = logHist(page);
    }else {
	msg = logByID(id);
    }
    
    editOriginalInteractionResponse(bot, interaction.token, {
	customId: `${page}`,
	embeds: [
	    {
		title: "Log Preview",
		type: "rich",
		description: `\`\`\`ansi
${msg}
\`\`\``		
	    }
	],
	components: id?undefined:makeComponents(page)
    });
}

addBotCommand(bot, {
    type: "slash",
    name: "log",
    description: "Get some logs",
    noLog: true,
    options :[
	{
	    name: "id",
	    description: "ID of Log",
	    type: ApplicationCommandOptionTypes.Integer
	}
    ],
    actions: [
	logGet,
    ],
});
