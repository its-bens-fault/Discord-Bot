project('concord', 'c',
  version : '2.3.0-dev',
  default_options : [
    'c_std=gnu99',
    'warning_level=3',
    'prefer_static=true'
  ])

concord_inc_path = 'concord'

core_inc = include_directories('./core')
codec_inc = include_directories('./gencodecs')
codec_api_inc = include_directories('./gencodecs/api')
concord_inc = include_directories('./include')

concord_src = []

subdir('core')
subdir('gencodecs')
subdir('src')

concord_lib = library('concord',
                      concord_src,
                      c_args: [
                        '-D_XOPEN_SOURCE=600',
                        '-DLOG_USE_COLOR',
                        '-DCCORD_SIGINTCATCH',
                      ],
                      include_directories : [
                        core_inc,
                        concord_inc,
                      ],
                      dependencies : [
                        dependency('libcurl'),
                        dependency('threads'),
                      ],
                      link_whole: [
                        core_lib,
                      ],
                      install : true)

concord_dep = declare_dependency(
  include_directories: [core_inc, concord_inc, codec_inc],
  link_with: concord_lib,
  sources: codec_h,
)

install_subdir(
  'include',
  install_dir: get_option('includedir') + '/' + concord_inc_path,
  strip_directory : true,
  install_tag: 'devel',
)

pkg = import('pkgconfig')

pkg.generate(libraries : concord_lib,
             version : '2.3.0-dev',
             subdirs: 'concord',
             name : 'libconcord',
             filebase : 'concord',
             description : 'C Discord Library')
