# Nix entry points: SchellingBoard built from source, a NixOS service for
# hosting it, and a shell with the tools it is developed with. None of it is
# needed to use or work on the project; Docker and `make install` remain the
# documented paths.
{
  description = "SchellingBoard, a scheduling app for participant-driven events";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = {
    self,
    nixpkgs,
  }: let
    lib = nixpkgs.lib;
    linux = ["x86_64-linux" "aarch64-linux"];
    forSystems = systems: f: lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    # The commit, for the footer's version, as scripts/app-version.js gives it.
    appVersion = lib.substring 0 8 (self.rev or self.dirtyRev or "dev");
  in {
    packages = forSystems linux (pkgs: {
      default = self.packages.${pkgs.stdenv.hostPlatform.system}.schellingboard;
      schellingboard = pkgs.callPackage ./package.nix {inherit appVersion;};
    });

    overlays.default = final: prev: {
      schellingboard = final.callPackage ./package.nix {inherit appVersion;};
    };

    # services.schellingboard; see docs/public/self-hosting/nixos.md
    nixosModules.default = import ./module.nix self.packages;

    checks = forSystems linux (pkgs: {
      package = self.packages.${pkgs.stdenv.hostPlatform.system}.default;

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
    });

    devShells = forSystems (linux ++ ["aarch64-darwin"]) (pkgs: {
      default = pkgs.mkShell {
        packages = [
          pkgs.bun
          pkgs.nodejs
          pkgs.gnumake
          # better-sqlite3 is compiled against Node's ABI on install.
          pkgs.python3
          pkgs.pkg-config
          # For reading the database directly, as the backup guide does.
          pkgs.sqlite
        ];
      };
    });

    formatter = forSystems (linux ++ ["aarch64-darwin"]) (pkgs: pkgs.alejandra);
  };
}
