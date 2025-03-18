#ifndef STARBOT_COMMANDS_H
#define STARBOT_COMMANDS_H

#include "discord.h"
#include <stdlib.h>
#include <string.h>
#include <log.h>

// Check if DISCORD_TOKEN was specified at compile time
#ifndef DISCORD_TOKEN
// if not, replace instances of this with getting the env variable
#define GET_DISCORD_TOKEN() getenv("DISCORD_TOKEN")
#else
#define GET_DISCORD_TOKEN() DISCORD_TOKEN
#endif

/* Inserts, updates, or deletes commands based on currently available global commadns */
CCORDcode interactions_upsert(struct discord *client, const struct discord_ready *event,
                         struct discord_application_commands commands);

// Starts the definition of a list of application commands
#define INTERACTION_CREATE_START                                               \
  struct discord_application_command global_commands[] = {

// For creation of simple application commands
#define INTERACTION_CREATE(str, int_description, int_type)                     \
  (struct discord_application_command){.name = #str,                           \
                                       .description = int_description,         \
                                       .type = int_type,                       \
                                       .options = NULL},
// For creation of application commands with options, do all the
// tedious stuffs for us
#define INTERACTION_CREATE_W_OPT(str, int_description, int_type, int_options)  \
  (struct discord_application_command){                                        \
      .name = #str,                                                            \
      .description = int_description,                                          \
      .type = int_type,                                                        \
      .options = &(struct discord_application_command_options){                \
          .array = &int_options[0],                                            \
          .realsize = sizeof(int_options) / sizeof(*int_options),              \
          .size = sizeof(int_options) / sizeof(*int_options)}},
// Kinda silly
#define INTERACTION_CREATE_END                                                 \
  }
// This code is kinda a bad macro, as it just assumes the names of
// variables that should exist, but it's also doing that
// because... well I want it to, so there
#define INTERACTION_UPDATE_BOT						\
  interactions_upsert(							\
      client, event,                                                           \
      (struct discord_application_commands){                                   \
          .array = &global_commands[0],                                        \
          .realsize = sizeof(global_commands) / sizeof(global_commands[0]),    \
          .size = sizeof(global_commands) / sizeof(global_commands[0]),        \
      });

// You don't have to spread macros onto newlines at all, you could just. Not.
#define INTERACTION_CALL(str, command) if (strcmp(event->data->name, str)==0) log_debug("Calling command: " #str " -> " #command), command(client, event)

// Now, in C a header says what should exist: a .c file says how it
// exists, and they don't all have to be in the same .c file
void command_pong(struct discord *, const struct discord_interaction *event);
void command_quote(struct discord *, const struct discord_interaction *event);
void command_stupify(struct discord *, const struct discord_interaction *event);

#endif
