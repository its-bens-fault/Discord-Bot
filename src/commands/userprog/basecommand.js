import {
    ApplicationCommandOptionTypes,
} from "../../../deps.js";
import { bot } from "../../../bot.js";
import { addBotCommand } from "../../lib/commands.js";

import { } from "../../lib/usercomms/commandDB.js";

import { masterAction, masterRunAction } from "../../lib/usercomms/masterAction.js";

const maxCommandName = 30;

addBotCommand(bot, {
    description: "Run and Make Custom Programs and Games!",
    name: "usergame",
    options: [{
	name: "create",
	description: "Create a new command",
	type: ApplicationCommandOptionTypes.SubCommand,
	options: [
	    {
		name: "command",	    
		type: ApplicationCommandOptionTypes.String,
		description: "The name of the command you're making",
		required: true,
		max_length: maxCommandName
	    },
	]
    }, {
	name: "update",
	description: "Update an existing command *you* made",
	type: ApplicationCommandOptionTypes.SubCommand,
	options: [
	    {
		name: "command",	    
		type: ApplicationCommandOptionTypes.String,
		description: "The name of the command you're updating",
		required: true,
		max_length: maxCommandName
	    },
	]
    }, {
	name: "run",
	description: "Run an existing command",
	type: ApplicationCommandOptionTypes.SubCommand,
	options: [
	    {
		name: "command",	    
		type: ApplicationCommandOptionTypes.String,
		description: "The name of the command you want to run",
		required: true,
		max_length: maxCommandName
	    }, {
		name: "input",
		type: ApplicationCommandOptionTypes.String,
		description: "Input text for the command",
		required: false,
	    }, {
		name: "hidden",
		type: ApplicationCommandOptionTypes.Boolean,
		description: "Should only you see this?",
		required: false,
	    },
	]
    }, {
	name: "delete",
	description: "Delete an existing command *you* made",
	type: ApplicationCommandOptionTypes.SubCommand,
	options: [
	    {
		name: "command",	    
		type: ApplicationCommandOptionTypes.String,
		description: "The name of the command you're deleting",
		required: true,
		max_length: maxCommandName
	    },
	]
    }, {
	name: "info",
	description: "Get info about a command",
	type: ApplicationCommandOptionTypes.SubCommand,
	options: [
	    {
		name: "command",	    
		type: ApplicationCommandOptionTypes.String,
		description: "The name of the command you want info on",
		required: true,
		max_length: maxCommandName
	    },
	]
    }, {
	name: "list",
	description: "List all commands!",
	type: ApplicationCommandOptionTypes.SubCommand,
	options: [
	]
    }],
    type: "slash",
    actions: [
	masterAction
    ]
});

addBotCommand(bot, {
    description: "Run a User Command on a Message",
    name: "userrun",
    type: "message",
    actions: [
	masterRunAction
    ]
});
