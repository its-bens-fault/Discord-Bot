#include "commands.h"
#include "application_command.h"
#include "discord-response.h"
#include "discord_codecs.h"
#include "types.h"
#include <string.h>

enum command_create_status {
  CREATE_NOOP,
  CREATE_NEW,
  CREATE_UPDATE,
};

void done_app_command(struct discord *client, struct discord_response *event,
                      const struct discord_application_command *cmd) {
  char *cmd_name = event->data;
  log_debug("Successfully submitted create/modify for command: %s", cmd_name);
}

void done_app_command_del(struct discord *client, struct discord_response *event) {
  char *cmd_name = event->data;
  log_debug("Successfully submitted create/modify for command: %s", cmd_name);
}

void fail_app_command(struct discord *client, struct discord_response *event) {
  char *cmd_name = event->data;
  log_error("Failed to create/modify command: %s", cmd_name);
}

void clean_app_command(struct discord *client, void *data) {
  char *cmd_name = data;
  log_debug("Cleaning up command creation/modification of %s.", cmd_name);
  free(data);
}

struct ___cmd_update_data {
  u64snowflake app_id;
  struct discord_application_commands commands;
};

void update_differed_commands(struct discord *client, struct discord_response *event, const struct discord_application_commands *old_commands) {
  struct ___cmd_update_data *data = event->data;
  struct discord_application_commands new_commands = data->commands;
  log_debug("Number of new commands: %d (%d)", new_commands.size, new_commands.realsize);
  for (int i=0; i<new_commands.size; i++) {
    struct discord_application_command new_command = new_commands.array[i];
    struct discord_application_command old_command;
    log_debug("Checking command: %s", new_command.name);
    enum command_create_status cmd_new = CREATE_NEW;
    bool command_delete = false;
    for (int j=0; j<old_commands->size; j++) {
      old_command = old_commands->array[j];
      if (strcmp(new_command.name, old_command.name)==0) {
	cmd_new = CREATE_NOOP;
	#define JSON_BUF 4096
	char cmd1_js[JSON_BUF], cmd2_js[JSON_BUF];
	discord_application_command_to_json(cmd1_js, sizeof(cmd1_js)/sizeof(cmd1_js[0]), &new_command);
	discord_application_command_to_json(cmd2_js, sizeof(cmd2_js)/sizeof(cmd2_js[0]), &new_command);
	if (strcmp(cmd1_js, cmd2_js)!=0) cmd_new = CREATE_UPDATE;
	if (new_command.type != old_command.type) {
	  command_delete = true;
	  if (cmd_new == CREATE_UPDATE) cmd_new = CREATE_NEW;
	}
	break;
      }
    }
    if (command_delete) {
      struct discord_ret del_ret = {
	.done = done_app_command_del,
	.fail = fail_app_command,
	.cleanup = clean_app_command,
      };
      del_ret.data = strdup(old_command.name);
      discord_delete_global_application_command(client, old_command.application_id, old_command.id, &del_ret);
    }
    if (cmd_new == CREATE_NEW) {
      log_debug("Creating new command: %s", new_command.name);
      struct discord_ret_application_command ret_edit = {
	.done = done_app_command,
	.fail = fail_app_command,
	.cleanup = clean_app_command,
      };
      ret_edit.data = strdup(new_command.name);
      struct discord_create_global_application_command cmd_make = {
	.name = new_command.name,
	.description = new_command.description,
	.default_member_permissions = new_command.default_member_permissions,
	.default_permission = new_command.default_permission,
	.dm_permission = new_command.dm_permission,
	.options = new_command.options,
	.type = new_command.type,
      };
      discord_create_global_application_command(client, data->app_id, &cmd_make, &ret_edit);
      log_debug("Submitted command for creation: %s", new_command.name);
    }else if (cmd_new == CREATE_UPDATE) {
      log_debug("Updating existing command: %s", new_command.name);
      struct discord_ret_application_command ret_edit = {
      	.done = done_app_command,
	.fail = fail_app_command,
	.cleanup = clean_app_command,
      };
      ret_edit.data = strdup(new_command.name);
      // TODO: Optimize diff of old and new
      struct discord_edit_global_application_command cmd_edits = {
	.name = new_command.name,
	.description = new_command.description,
	.default_member_permissions = new_command.default_member_permissions,
	.default_permission = new_command.default_permission,
	.dm_permission = new_command.dm_permission,
	.options = new_command.options,
      };
      discord_edit_global_application_command(client, old_command.application_id, old_command.id, &cmd_edits, &ret_edit);
      log_debug("Submitted command for modification: %s", new_command.name);
    }else if (cmd_new == CREATE_NOOP) {
      log_debug("Command %s already exists... skipping.", new_command.name);
    }
  }
}

void fail_differed_commands(struct discord *client, struct discord_response *event) {
  log_error("Failed to get existing application commands. No updates to commands will be submitted");
}

void cleanup_differed_commands(struct discord *client, void* data) {
  log_debug("Cleanup: Get Application Commands");
  free(data);
}

CCORDcode interactions_upsert(struct discord* client, const struct discord_ready *event, struct discord_application_commands commands) {
  struct ___cmd_update_data *forward_data;
  forward_data = malloc(sizeof(*forward_data));
  memcpy(&forward_data->commands, &commands, sizeof(commands));
  forward_data->app_id = event->application->id;
  
  struct discord_ret_application_commands existing_commands = {
    .data = forward_data,
    .done = &update_differed_commands,
    .fail = &fail_differed_commands,
    .cleanup = &cleanup_differed_commands,
  };

  discord_get_global_application_commands(client, event->application->id, &existing_commands);
  return CCORD_OK;
}
