#ifndef STARBOT_COMMANDS_H
#define STARBOT_COMMANDS_H

#include "discord.h"
#include <stdlib.h>
#include <string.h>
#include <log.h>

#ifndef DISCORD_TOKEN
#define GET_DISCORD_TOKEN() getenv("DISCORD_TOKEN")
#else
#define GET_DISCORD_TOKEN() DISCORD_TOKEN
#endif

/* Inserts, updates, or deletes commands based on currently available global commadns */
CCORDcode interactions_upsert(struct discord *client, const struct discord_ready *event,
                         struct discord_application_commands commands);

#define INTERACTION_CREATE_START                                               \
  struct discord_application_command global_commands[] = {

#define INTERACTION_CREATE(str, int_description, int_type)                     \
  (struct discord_application_command){.name = #str,                           \
                                       .description = int_description,         \
                                       .type = int_type,                       \
                                       .options = NULL},

#define INTERACTION_CREATE_W_OPT(str, int_description, int_type, int_options)  \
  (struct discord_application_command){                                        \
      .name = #str,                                                            \
      .description = int_description,                                          \
      .type = int_type,                                                        \
      .options = &(struct discord_application_command_options){                \
          .array = &int_options[0],                                            \
          .realsize = sizeof(int_options) / sizeof(*int_options),              \
          .size = sizeof(int_options) / sizeof(*int_options)}},

#define INTERACTION_CREATE_END                                                 \
  }                                                                            
#define INTERACTION_UPDATE_BOT						\
  interactions_upsert(							\
      client, event,                                                           \
      (struct discord_application_commands){                                   \
          .array = &global_commands[0],                                        \
          .realsize = sizeof(global_commands) / sizeof(global_commands[0]),    \
          .size = sizeof(global_commands) / sizeof(global_commands[0]),        \
      });

    
#define INTERACTION_CALL(str, command) if (strcmp(event->data->name, str)==0) log_debug("Calling command: " #str " -> " #command), command(client, event)

void command_pong(struct discord *, const struct discord_interaction *event);
void command_quote(struct discord *, const struct discord_interaction *event);
void command_stupify(struct discord *, const struct discord_interaction *event);

#endif
