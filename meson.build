project('StarBot', 'c',
  version : '0.0.1',
  default_options : ['warning_level=3',
                     'prefer_static=true',
                     'default_library=static'])

if get_option('DISCORD_TOKEN') != ''
  add_project_arguments('-DDISCORD_TOKEN="'+get_option('DISCORD_TOKEN')+'"', language : 'c')
endif

starbot_src = [ ]

subdir('./src')

executable('starbot',
           starbot_src,
           dependencies : [
             dependency('concord'),
             dependency('sqlite3'),
           ],
           install : true)
