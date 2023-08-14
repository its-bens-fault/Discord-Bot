{
  description = "Denocord Discord Bot";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.flatTmpFuse.url = "github:CyborgPotato/FuseFlatTmpfs";
  inputs.flatTmpFuse.inputs.nixpkgs.follows = "nixpkgs";

  outputs = { self, nixpkgs, flake-utils, flatTmpFuse }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      tmpfsFlat = flatTmpFuse.packages.${system}.default;
      py = pkgs.python3;

      pyenv = py.withPackages (p: with p; [
        matplotlib
        numpy
        scipy
        pillow
      ]);      

      deps = with pkgs; [
        deno
        # Graphs
        d2
        # Convert SVG to PNG on the fly D2 when parsing outputing
        # via stdout only does SVG, hence to send over Discord we
        # cheat and convert to PNG.
        librsvg
        # Funny WingDing Language
        cbqn
        # Python
        pyenv
        # Sandboxing tool, for safety executing... well, Arbitrary code.
        bubblewrap
        # Directory Userspace TMPFS w/ limits
        tmpfsFlat
        fuse3
        # timeout
        coreutils
        # Chess
        gnuchess
      ];
      
      # The thing that runs starbot
      starBot = pkgs.writeShellApplication {
        name = "starbot";
        runtimeInputs = deps;
        text = ''
          deno run -A main.js
        '';
      };

      tests = pkgs.writeShellApplication {
        name = "tests";
        runtimeInputs = deps;
        text = ''
          deno test -A
        '';
      };

      lints = pkgs.writeShellApplication {
        name = "lints";
        runtimeInputs = deps;
        text = ''
          deno lint
        '';
      };

      mkImage = (tag: pkgs.dockerTools.buildImage {
        name = "starbot";
        tag = "${tag}";
        copyToRoot = pkgs.buildEnv {
          name = "starbot-root";
          paths = [
            starBot
            tests
            lints
            pkgs.bashInteractive
          ] ++ deps;
          pathsToLink = [
            "/bin"
          ];
        };
      });
    in {
      apps.default = {
        type = "app";
        program = "${starBot}/bin/starbot";
      };

      apps.tests = {
        type = "app";
        program = "${tests}/bin/tests";
      };
      
      packages.StarBot = mkImage "latest";

      packages.StarBot-Test = mkImage "dev";
      
      devShells.default = pkgs.mkShell {
        nativeBuildInputs = [ pkgs.bashInteractive ];
        buildInputs = deps ++ (with pkgs; [
          sqlite          
        ]);
      };
    });
}
