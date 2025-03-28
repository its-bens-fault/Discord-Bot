#include "discord_codecs.h"
#include "logging.h"
#include "commands.h"
#include "src/commands.h"

/* This defines an array ([]) of a structured (struct) variable that
   contains the information about command options. Each type is
   labelled as some kind of string (char*), or boolean, or enum */
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

/* These are some handy macros to make defining a set of global
   commands quick & easy, also to demonstrate what Macros in C
   are... they are also a mess. You can see the definitions of these
   macros in the header "commands.h" */
INTERACTION_CREATE_START
  INTERACTION_CREATE(ping, "Ping Pong Time!", DISCORD_APPLICATION_CHAT_INPUT)
  INTERACTION_CREATE_W_OPT(quote, "Create a very inspirational quote", DISCORD_APPLICATION_CHAT_INPUT, quote_opts)
  INTERACTION_CREATE(quoth, NULL, DISCORD_APPLICATION_MESSAGE)
  INTERACTION_CREATE_W_OPT(stupify-my-words, "Send a message but without a few letters", DISCORD_APPLICATION_CHAT_INPUT, stupify_opts)
  INTERACTION_CREATE(stupify, NULL, DISCORD_APPLICATION_MESSAGE)
INTERACTION_CREATE_END;

/* This is a callback function (well a regular function used as a callback) */
void on_ready(struct discord *client, const struct discord_ready *event) {
  log_trace("I'm ready!!");
  INTERACTION_UPDATE_BOT;
}

/* Same for this, as above, so below */
void on_interaction(struct discord *client, const struct discord_interaction *event) {
  /* Just like before these are convenience macros for checking
     whether the command of interest is being called, and designating,
     if it is, what function should be called in turn to do whatever
     it is that needs to be done */
  log_trace("Interaction received... %p", event);
  INTERACTION_CALL("ping", command_pong);
  INTERACTION_CALL("quote", command_quote); /* <----- You may notice these have the same function. that's okay!   */
  INTERACTION_CALL("quoth", command_quote); /* <-/    All interactions get forwarded the same info, and so we can handle it */
  INTERACTION_CALL("stupify-my-words", command_stupify);
  INTERACTION_CALL("stupify", command_stupify);
}

/* This is where it all begins */
int main(void) {
  // First we configure logging, so we know what's happening
  starbot_configure_logging();
  log_trace("Connecting to discord...");
  // We start Discord: either getting the Token from the environment,
  // oooor, it can be compiled *into* the program itself (less secure
  // if it ever, y'know' leaves)
  struct discord *client = discord_init(GET_DISCORD_TOKEN());
  // We do need to still specify intents, just like in Discor(deno)
  discord_add_intents(client, DISCORD_GATEWAY_GUILDS |
		      DISCORD_GATEWAY_GUILD_MESSAGES |
                                  DISCORD_GATEWAY_MESSAGE_CONTENT |
		      DISCORD_GATEWAY_GUILD_MEMBERS |
                                  DISCORD_GATEWAY_GUILD_MESSAGE_REACTIONS |
                                  DISCORD_GATEWAY_GUILD_WEBHOOKS |
                                  DISCORD_GATEWAY_DIRECT_MESSAGES);
  // We can now tell the library which of our functions to call when:
  // the client is ready v
  discord_set_on_ready(client, &on_ready);
  // when interactions happen v
  discord_set_on_interaction_create(client, &on_interaction);
  // Now we tell it to start v
  discord_run(client);
}
