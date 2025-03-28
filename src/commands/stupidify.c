#include "../commands.h"
#include <stdlib.h>
#include <string.h>

void command_stupify(struct discord *client, const struct discord_interaction *event) {
  char* original = "Nothing to see here";

  switch (event->data->type) {
  case DISCORD_INTERACTION_APPLICATION_COMMAND:
    original = event->data->options->array[0].value;
    break;
  case DISCORD_INTERACTION_MESSAGE_COMPONENT:;
    json_char *msg_json = event->data->resolved->messages;
    struct discord_messages msgs;
    discord_messages_from_json(msg_json, strlen(msg_json), &msgs);
    if (msgs.size > 0) {
      struct discord_message msg = msgs.array[0];
      original = msg.content;
    }
    break;
  default:
    original = "No message to stupify";
    log_error("Type of interaction not supported");
    break;
  }
  log_trace("Stupifying: %s", original);

  size_t l_orig = strlen(original);
  char* response = malloc(l_orig);
  size_t l_resp = 0;
  for (size_t i=0; i<l_orig; i++) {
    char c = original[i];
    if ((c >= 'g' && c <= 'l') || (c >= 'G' && c <= 'L'))
      continue;
    response[l_resp++] = c;
  }
  response[l_resp] = '\0';

  struct discord_interaction_response params = {
    .type = DISCORD_INTERACTION_CHANNEL_MESSAGE_WITH_SOURCE,
    .data = &(struct discord_interaction_callback_data){
      .content = response
    }
  };
  discord_create_interaction_response(client, event->id,
				      event->token, &params, NULL); 
  free(response);
}
