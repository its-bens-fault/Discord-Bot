#include "../commands.h"
#include <stdio.h>
#include <time.h>

// This is a very simple command
void command_pong(struct discord *client, const struct discord_interaction *event) {
  // It takes the event id, which is actually a timestamp
  u64snowflake time_sent = (event->id >> 22) + 1420070400000;
  struct timespec now;
  // Then we get the time that is right now
  clock_gettime(CLOCK_REALTIME, &now);

  // This time sometimes is negative? idk if that's because of a
  // problem with my conversion (probably) or with time syncronization
  // between Discord's server etc.
  // And we get the difference between time_sent and our time received
  double diff = (now.tv_sec * 1000 + (double) now.tv_nsec / 1000000) - time_sent;

  // Create a small little buffer to store our response
  char response[512];

  // And create a nice pretty formatted string to send back
  snprintf(&response[0], sizeof(response), "Pong! %.3g ms", diff);

  // Specify the parameters of how we'd like to respond
  struct discord_interaction_response params = {
    .type = DISCORD_INTERACTION_CHANNEL_MESSAGE_WITH_SOURCE,
    .data = &(struct discord_interaction_callback_data){
      .content = &response[0]
    }
  };
  // And respond!
  discord_create_interaction_response(client, event->id,
				      event->token, &params, NULL); 
}
