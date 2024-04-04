{
  description = "StarBot, but Smaller";

  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      version = "0.0.1";

      name = "starbot";
      
      pkgs = import nixpkgs {
        inherit system;
      };

      pkgs-windows = pkgs.pkgsCross.mingwW64;

      # For Linux Specific Dependencies
      linux' = pkgs.lib.optional pkgs.stdenv.isLinux;
      # For MacOS Specific Dependencies
      darwin' = pkgs.lib.optional pkgs.stdenv.isDarwin;

      nativeBuildInputs = with pkgs; [
        meson
        ninja
        pkg-config
      ];      

      bDeps = p: with p; [
        curl
      ] ++ (linux' [
      ]) ++ (darwin' ([
      ] ++ (with darwin.apple_sdk.frameworks; [
      ])));
      
      pbDeps = p: with p; [
      ];

      sharedEnv = let
        mesonWrapCache = let
          mesonPy = pkgs.python3.withPackages (p: [p.meson]); 
        in import (pkgs.runCommand "meson-wrap-${name}-${version}" {} ''
          ${mesonPy}/bin/${mesonPy.executable} ${./mesonWrapFetch.py} ${./.} > $out
        '') { inherit pkgs; };
        fs = pkgs.lib.fileset;
      in  {
        pname = name;
        inherit version;
        src = fs.toSource {
          root = ./.;
          fileset = fs.unions [
            ./meson.build
            ./meson.options
            ./src
            ./subprojects
          ];
        };
        
        inherit nativeBuildInputs;
        
        preConfigure = ''
          mkdir subprojects/packagecache
          ${builtins.concatStringsSep ";" (builtins.attrValues (builtins.mapAttrs (n: v: "cp ${v} subprojects/packagecache/${n}") mesonWrapCache))}
        '';
      };

      starbot = pkgs.stdenv.mkDerivation (sharedEnv // {
        buildInputs = bDeps pkgs;

        propagatedBuildInputs = pbDeps pkgs;
      });

      starbot-exe = pkgs-windows.stdenv.mkDerivation ( sharedEnv // {        
        buildInputs = bDeps pkgs-windows;
        
        propagatedBuildInputs = pbDeps pkgs-windows;
      });
      
      mkImage = (tag: pkgs.dockerTools.buildImage {
        name = "starbot";
        tag = "${tag}";
        copyToRoot = pkgs.buildEnv {
          name = "starbot-root";
          paths = [
            starbot
            pkgs.bashInteractive
          ];
          pathsToLink = [
            "/bin"
          ];
        };
        config.Env = [ "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt" ];
      });
    in {
      packages = {
        default = starbot;
        inherit starbot starbot-exe;

        StarBot = mkImage "latest";
        StarBot-Test = mkImage "dev";
      };
      
      apps = rec {
        default = flake-utils.lib.mkApp { drv = self.packages.${system}.default; };
      };

      devShells = {
        default = pkgs.mkShell {
          inputsFrom = [ starbot ];
          packages = (with pkgs; [
            clang-tools
            (python3.withPackages (p: [p.meson p.ipython]))
          ]);
        };
        inherit starbot;
      };
    });
}
