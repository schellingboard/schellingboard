# Nix entry points: SchellingBoard built from source, a NixOS service for
# hosting it, and a shell with the tools it is developed with. None of it is
# needed to use or work on the project; Docker and `make install` remain the
# documented paths.
{
  description = "SchellingBoard, a scheduling app for participant-driven events";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
    bun2nix = {
      url = "github:nix-community/bun2nix";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-parts.follows = "flake-parts";
    };
  };

  outputs = inputs @ {
    self,
    flake-parts,
    ...
  }:
    flake-parts.lib.mkFlake {inherit inputs;} ({lib, ...}: let
      # The commit, for the footer's version, as scripts/app-version.js gives it.
      appVersion =
        if self ? rev
        then lib.substring 0 8 self.rev
        else if self ? dirtyRev
        then "${lib.substring 0 8 self.dirtyRev}-dirty"
        else "dev";
      schellingboard = pkgs:
        pkgs.callPackage ./package.nix {
          inherit appVersion;
          bun2nix = inputs.bun2nix.packages.${pkgs.stdenv.hostPlatform.system}.default;
        };
    in {
      systems = ["x86_64-linux" "aarch64-linux" "aarch64-darwin"];

      flake = {
        overlays.default = final: prev: {
          schellingboard = schellingboard final;
        };

        # services.schellingboard; see docs/public/self-hosting/nixos.md
        nixosModules.default = import ./module.nix self.packages;
      };

      perSystem = {
        pkgs,
        self',
        ...
      }: {
        # The app runs on Linux; macOS gets the shell for working on it.
        packages = lib.optionalAttrs pkgs.stdenv.hostPlatform.isLinux {
          default = self'.packages.schellingboard;
          schellingboard = schellingboard pkgs;
        };

        checks = lib.optionalAttrs pkgs.stdenv.hostPlatform.isLinux {
          package = self'.packages.default;

          # Boots a machine with the service on and checks that it serves, made
          # its secret and database, and logged the first admin's link.
          nixos = pkgs.testers.runNixOSTest {
            name = "schellingboard";
            nodes.machine = {
              imports = [self.nixosModules.default];
              services.schellingboard = {
                enable = true;
                settings.SITE_URL = "http://machine:3000";
              };
              virtualisation.memorySize = 1024;
            };
            testScript = ''
              machine.wait_for_unit("schellingboard.service")
              machine.wait_for_open_port(3000)
              machine.succeed("curl -fsS http://localhost:3000/api/health | grep -q ok")
              machine.succeed("curl -fsS http://localhost:3000/ | grep -qi '<html'")
              machine.succeed("test -s /var/lib/schellingboard/auth-secret")
              machine.succeed("test -s /var/lib/schellingboard/data.db")
              machine.wait_until_succeeds("journalctl -u schellingboard | grep -qi admin")

              # The secret survives a restart, so sign-ins do too.
              before = machine.succeed("cat /var/lib/schellingboard/auth-secret")
              machine.systemctl("restart schellingboard.service")
              machine.wait_for_open_port(3000)
              assert before == machine.succeed("cat /var/lib/schellingboard/auth-secret")
            '';
          };
        };

        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.bun
            pkgs.nodejs
            # The Makefile's tasks: `make install`, `make dev`, `make test`.
            pkgs.gnumake
            # For reading the database directly, as the backup guide does.
            pkgs.sqlite
          ];
        };

        formatter = pkgs.alejandra;
      };
    });
}
