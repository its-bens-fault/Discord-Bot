#include "../commands.h"
#include "curl/curl.h"
#include "curl/easy.h"
#include "discord-response.h"
#include "discord.h"
#include "discord_codecs.h"
#include "error.h"
#include "guild.h"
#include "json-build.h"
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include "jsmn-find.h"
#include "jsmn.h"

#define STRUCT_BUFF_INITIAL_SIZE 4096

struct buff {
  size_t realsize;
  size_t size;
  char *buff;
};

size_t write_callback(char *ptr, size_t size, size_t nmemb, void *userdata) {
  struct buff *data = userdata;
  size_t ndata = size*nmemb;
  
  if (data->buff == NULL) {
    data->buff = malloc(STRUCT_BUFF_INITIAL_SIZE);
    if (data->buff == NULL) return 0;
    data->realsize = STRUCT_BUFF_INITIAL_SIZE;
    data->size = 0;
  }

  if (data->size + ndata >= data->realsize) {
    data->buff = realloc(data->buff, data->size + ndata + data->realsize);
    if (data->buff == NULL) return 0;
    data->realsize = data->realsize * 2;
  }

  memcpy(&data->buff[data->size], ptr, ndata);
  
  data->size += ndata;
  return ndata;
}

void command_quote(struct discord *client, const struct discord_interaction *event) {
  char* author = "NO AUTHOR FOUND";
  char* quote = "YOU SHOULD NEVER SEE THIS!";
  log_trace("Generating quote... type: %p (%d)", event, event->type);
  switch (event->data->type) {
  case DISCORD_INTERACTION_APPLICATION_COMMAND:
    for (int i=0; i<event->data->options->size; i++) {
      char* name = event->data->options->array[i].name;
      if (strcmp(name,"author")==0)
	author = event->data->options->array[i].value;
      else if (strcmp(name,"quote")==0)
	quote = event->data->options->array[i].value;
    }
    break;
  case DISCORD_INTERACTION_MESSAGE_COMPONENT:;
    json_char *msg_json = event->data->resolved->messages;
    struct discord_messages msgs;
    discord_messages_from_json(msg_json, strlen(msg_json), &msgs);
    if (msgs.size > 0) {
      struct discord_message msg = msgs.array[0];
      struct discord_guild_member member = {0};
      struct discord_ret_guild_member ret_mem = {
	.sync = &member,
      };
      CCORDcode ccode = discord_get_guild_member(client, event->guild_id, msg.author->id, &ret_mem);
      if (ccode == CCORD_OK)
	author = member.nick;
      else
	author = msg.author->username;
      quote = msg.content;
    }
    break;
  default:
    log_error("Type of interaction not supported");
    break;
  }

  CURL* curl_handle;
  struct curl_slist *slist = NULL;
  
  char* host = "https://quozio.com";
  char* path = "api/v1/quotes";
  
  char request[1024];

  // Buffer to receive data from POST/GET
  struct buff recv = {0};
  jsmn_parser parser;
  jsmntok_t *toks = NULL;
  unsigned n_toks;
  jsmnf_loader loader;
  jsmnf_pair *pairs = NULL;
  unsigned n_pairs;

  snprintf(request, sizeof(request), "%s/%s", host, path);

  curl_handle = curl_easy_init();
  curl_easy_setopt(curl_handle, CURLOPT_URL, request);

  slist = curl_slist_append(slist, "Content-Type: application/json");
  slist = curl_slist_append(slist, "Accept: application/json");
  curl_easy_setopt(curl_handle, CURLOPT_HTTPHEADER, slist);

  log_trace("Forming POST query to %s...", request);
  jsonb req;
  char buf[4096];
  jsonb_init(&req);
  jsonb_object(&req, buf, sizeof(buf)); {
      jsonb_key(&req, buf, sizeof(buf), "author", sizeof("author")-1);
      jsonb_string(&req, buf, sizeof(buf), author, strlen(author));

      jsonb_key(&req, buf, sizeof(buf), "quote", sizeof("quote")-1);
      jsonb_string(&req, buf, sizeof(buf), quote, strlen(quote));
  } jsonb_object_pop(&req, buf, sizeof(buf));
  log_trace(buf);

  curl_easy_setopt(curl_handle, CURLOPT_POSTFIELDS, buf);
  curl_easy_setopt(curl_handle, CURLOPT_WRITEDATA, &recv);
  curl_easy_setopt(curl_handle, CURLOPT_WRITEFUNCTION, write_callback);
  curl_easy_perform(curl_handle);

  jsmn_init(&parser);
  jsmn_parse_auto(&parser, recv.buff, recv.size, &toks, &n_toks);

  jsmnf_init(&loader);
  jsmnf_load_auto(&loader, recv.buff, toks, n_toks, &pairs, &n_pairs);

  const char quoteid_key[] = "quoteId";
  jsmnf_pair *quoteid_pair = jsmnf_find(pairs, recv.buff, quoteid_key, sizeof(quoteid_key)-1);
  if (quoteid_pair == NULL) {
    log_error("Error getting quoteid from response: %s", recv.buff);
    return;
  }
  
  struct jsmnftok quoteid_tok = quoteid_pair->v;
  char *quoteid = malloc(quoteid_tok.len+1);
  memcpy(quoteid, &recv.buff[quoteid_tok.pos], quoteid_tok.len);
  quoteid[quoteid_tok.len] = '\0';
  
  log_trace("Got quoteid: %s", quoteid);

  recv.size = 0;
  free(toks); toks = NULL;
  free(pairs); pairs = NULL;
  curl_slist_free_all(slist);
  curl_easy_cleanup(curl_handle);

  path = "api/v1/templates";
  snprintf(request, sizeof(request), "%s/%s", host, path);
  log_trace("Forming GET query to %s...", request);

  curl_handle = curl_easy_init();
  curl_easy_setopt(curl_handle, CURLOPT_URL, request);
  curl_easy_setopt(curl_handle, CURLOPT_WRITEDATA, &recv);
  curl_easy_setopt(curl_handle, CURLOPT_WRITEFUNCTION, write_callback);
  curl_easy_perform(curl_handle);
  log_trace("Templates received in %zu bytes", recv.size);

  jsmn_init(&parser);
  jsmn_parse_auto(&parser, recv.buff, recv.size, &toks, &n_toks);

  jsmnf_init(&loader);
  jsmnf_load_auto(&loader, recv.buff, toks, n_toks, &pairs, &n_pairs);

  const char template_key[] = "data";
  jsmnf_pair *template_pair = jsmnf_find(pairs, recv.buff, template_key, sizeof(template_key)-1);
  int n_templates = template_pair->size;
  int template_idx = n_templates * ((double) rand() / (double) RAND_MAX);

  char template_idx_str[8];
  snprintf(template_idx_str, sizeof(template_idx_str), "%d", template_idx);

  char templateid_key[] = "templateId";
  char *templateid_path[2] = {template_idx_str, templateid_key};
  jsmnf_pair *templateid_pair = jsmnf_find_path(template_pair, recv.buff, templateid_path, sizeof(templateid_path) / sizeof *templateid_path);

  char *templateid = malloc(templateid_pair->v.len+1);
  memcpy(templateid, &recv.buff[templateid_pair->v.pos], templateid_pair->v.len);
  templateid[templateid_pair->v.len] = '\0';
  
  log_trace("Chose templateid: %s", templateid);

  recv.size = 0;
  free(toks); toks = NULL;
  free(pairs); pairs = NULL;
  curl_easy_cleanup(curl_handle);

  snprintf(request, sizeof(request), "%s/api/v1/quotes/%s/imageUrls?templateId=%s", host, quoteid, templateid);
  curl_handle = curl_easy_init();
  curl_easy_setopt(curl_handle, CURLOPT_URL, request);
  curl_easy_setopt(curl_handle, CURLOPT_WRITEDATA, &recv);
  curl_easy_setopt(curl_handle, CURLOPT_WRITEFUNCTION, write_callback);
  curl_easy_perform(curl_handle);
  recv.size = 0;
  log_trace("Forming GET query to %s...", request);
  curl_easy_perform(curl_handle);
  recv.buff[recv.size] = '\0';

  jsmn_init(&parser);
  jsmn_parse_auto(&parser, recv.buff, recv.size, &toks, &n_toks);

  jsmnf_init(&loader);
  jsmnf_load_auto(&loader, recv.buff, toks, n_toks, &pairs, &n_pairs);

  const char size_key[] = "medium";

  jsmnf_pair *size_pair = jsmnf_find(pairs, recv.buff, size_key, sizeof(size_key)-1);

  char response[2000];
  snprintf(response, sizeof(response), "%.*s", (int)size_pair->v.len, &recv.buff[size_pair->v.pos]);

  log_trace("Got %s image: %s", size_key, response);

  struct discord_interaction_response params = {
    .type = DISCORD_INTERACTION_CHANNEL_MESSAGE_WITH_SOURCE,
    .data = &(struct discord_interaction_callback_data){
      .content = response
    }
  };
  discord_create_interaction_response(client, event->id,
				      event->token, &params, NULL);

  recv.size = 0;
  free(toks); toks = NULL;
  free(pairs); pairs = NULL;
  curl_easy_cleanup(curl_handle);
  free(templateid);
  free(quoteid);
  free(recv.buff);
}
