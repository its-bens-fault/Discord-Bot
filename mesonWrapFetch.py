from glob import glob
from mesonbuild.wrap.wrap import PackageDefinition
import sys

print("{ pkgs, ... }: {")

for wrap in glob(f"{sys.argv[1]}/subprojects/*.wrap"):
    wrap = PackageDefinition.from_wrap_file(wrap)
    if 'source_url' in wrap.values:
        print(f"""  "{wrap.values['source_filename']}" = pkgs.fetchurl {{
    url = "{wrap.values['source_url']}";
    sha256 = "{wrap.values['source_hash']}";
  }};""")

    if 'patch_url' in wrap.values:
        print(f"""  "{wrap.values['patch_filename']}" = pkgs.fetchurl {{
    url = "{wrap.values['patch_url']}";
    sha256 = "{wrap.values['patch_hash']}";
  }};""")

print("}")
