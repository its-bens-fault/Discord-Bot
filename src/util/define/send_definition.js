// Get a word's definition from Urban Dictionary

import { logger } from "../../../logger.js";
import { editOriginalInteractionResponse } from "../../../deps.js";

export function sendDefinition(bot, interaction, result, dictUsed) {
    logger.debug("Sending a definition") // This should be parameterized but I don't want to right now
    editOriginalInteractionResponse(
	bot,
	interaction.token,
	formatDefinition(result, dictUsed),
    )
}

function formatDefinition(result, dictionary) {
    let data
    switch(dictionary) {
    case 0: {// If collins dictionary was used
	data = {
	    embeds: [{
		title: "Define " + result["word"],
		color: 0xe03b2c,
		fields: [{
		    name: "Definition",
		    value: "Not implemented"
		}]
	    }]
	};
	break;
    } case 1: {// If urban dictionary was used
	data = {
	    embeds: [{
		title: "Define " + result["word"],
		color: 0xe03b2c,
		author: {
		    name: "Urban Dictionary",
		    url: result["permalink"]
		},
		fields: [{
		    name: "Definition",
		    value: result["definition"].replaceAll("[", "").replaceAll("]", "")
		},{
		    name: "Example usage",
		    value: result["example"].replaceAll("[", "").replaceAll("]", "")
		}]
	    }]
	};
	break;
    }}
    console.log(data);
    return data;
}