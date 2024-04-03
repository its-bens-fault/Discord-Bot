#include "discord_codecs.h"
#include "logging.h"
#include "commands.h"
#include "src/commands.h"

void on_ready(struct discord *client, const struct discord_ready *event) {
  log_debug("I'm ready!!");

  struct discord_application_command_option quote_opts[] = {
    (struct discord_application_command_option) {
      .name = "quote",
      .description = "the quote text",
      .type = DISCORD_APPLICATION_OPTION_STRING,
      .required = true,
    },
    (struct discord_application_command_option) {
      .name = "author",
      .description = "who originally said the quote",
      .type = DISCORD_APPLICATION_OPTION_STRING,
      .required = true,
    },
  };

  struct discord_application_command_option stupify_opts[] = {
    (struct discord_application_command_option) {
        .name = "content",
        .description = "The original message to be \"corrected\"",
        .type = DISCORD_APPLICATION_OPTION_STRING,
	.required = true,
    }
  };  
  
  INTERACTION_CREATE_START
    INTERACTION_CREATE(ping, "Ping Pong Time!", DISCORD_APPLICATION_CHAT_INPUT)
    INTERACTION_CREATE_W_OPT(quote, "Create a very inspirational quote", DISCORD_APPLICATION_CHAT_INPUT, quote_opts)
    INTERACTION_CREATE(quoth, "Turn a message into an inspriational quote", DISCORD_APPLICATION_MESSAGE)
    INTERACTION_CREATE_W_OPT(stupify-my-words, "Send a message but without a few letters", DISCORD_APPLICATION_CHAT_INPUT, stupify_opts)
    INTERACTION_CREATE(stupify, "Stupify a message", DISCORD_APPLICATION_MESSAGE)
    INTERACTION_CREATE_END;
}

void on_interaction(struct discord *client, const struct discord_interaction *event) {
  INTERACTION_CALL("ping", command_pong);
  INTERACTION_CALL("quote", command_quote);
  INTERACTION_CALL("quoth", command_quote);
  INTERACTION_CALL("stupify-my-words", command_stupify);
  INTERACTION_CALL("stupify", command_stupify);
}

int main(void) {
  starbot_configure_logging();
  log_trace("Connecting to discord...");
  struct discord *client = discord_init(GET_DISCORD_TOKEN());
  discord_set_on_ready(client, &on_ready);
  discord_set_on_interaction_create(client, &on_interaction);
  discord_run(client);
}
