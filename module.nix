# services.schellingboard: SchellingBoard as a NixOS service, built from this
# repository. The flake passes in its packages, so the default is the build of
# the same commit.
packages: {
  config,
  lib,
  pkgs,
  ...
}: let
  cfg = config.services.schellingboard;
  stateDir = "/var/lib/schellingboard";
  secret = ["SITE_PASSWORD" "AUTH_SECRET" "SMTP_PASSWORD" "SMTP_URL"];
in {
  options.services.schellingboard = {
    enable = lib.mkEnableOption "SchellingBoard, a scheduling app for participant-driven events";

    package = lib.mkOption {
      type = lib.types.package;
      default = packages.${pkgs.stdenv.hostPlatform.system}.default;
      defaultText = lib.literalExpression "schellingboard.packages.\${system}.default";
      description = "The SchellingBoard package to run.";
    };

    port = lib.mkOption {
      type = lib.types.port;
      default = 3000;
      description = ''
        The port to listen on. The app listens on every address; the firewall
        keeps it closed unless `openFirewall` is set, so a reverse proxy on
        the same host is what reaches it.
      '';
    };

    openFirewall = lib.mkOption {
      type = lib.types.bool;
      default = false;
      description = ''
        Open `port` in the firewall, to reach the app directly: a laptop on
        the venue's wifi for a trial run. Installing it to a phone's home
        screen and notifications need HTTPS, so for an event put a reverse
        proxy in front instead.
      '';
    };

    settings = lib.mkOption {
      type = lib.types.attrsOf lib.types.str;
      default = {};
      example = lib.literalExpression ''
        {
          SITE_URL = "https://sessions.example.org";
          SB_TRUSTED_PROXIES = "1";
          SMTP_HOST = "smtp.example.org";
          SMTP_FROM = "sessions@example.org";
        }
      '';
      description = ''
        Environment variables for everything that is not secret; the
        Configuration guide lists every one. They end up in the
        world-readable Nix store, so put passwords in `environmentFile`.
      '';
    };

    environmentFile = lib.mkOption {
      type = lib.types.nullOr lib.types.path;
      default = null;
      example = "/run/secrets/schellingboard";
      description = ''
        A file of `NAME=value` lines for the secret settings:
        ${lib.concatMapStringsSep ", " (s: "`${s}`") secret}. Without an
        `AUTH_SECRET` in it, one is generated on the first start and kept in
        `${stateDir}/auth-secret`.
      '';
    };
  };

  config = lib.mkIf cfg.enable {
    assertions = [
      {
        assertion = !lib.any (s: cfg.settings ? ${s}) secret;
        message = ''
          services.schellingboard.settings holds one of ${lib.concatStringsSep ", " secret},
          which would be written to the world-readable Nix store. Put it in
          services.schellingboard.environmentFile.
        '';
      }
    ];

    systemd.services.schellingboard = {
      description = "SchellingBoard";
      wantedBy = ["multi-user.target"];
      wants = ["network-online.target"];
      after = ["network-online.target"];

      environment =
        {
          PORT = toString cfg.port;
          DATABASE_URL = "file:${stateDir}/data.db";
          SB_UPLOADS_DIR = "${stateDir}/uploads";
        }
        // cfg.settings;

      script = ''
        if [ -z "''${AUTH_SECRET:-}" ]; then
          if [ ! -s ${stateDir}/auth-secret ]; then
            (umask 077; head -c 32 /dev/urandom | base64 > ${stateDir}/auth-secret)
          fi
          AUTH_SECRET=$(cat ${stateDir}/auth-secret)
          export AUTH_SECRET
        fi
        exec ${lib.getExe cfg.package}
      '';

      serviceConfig = {
        EnvironmentFile = lib.optional (cfg.environmentFile != null) cfg.environmentFile;
        DynamicUser = true;
        StateDirectory = "schellingboard";
        StateDirectoryMode = "0700";
        Restart = "on-failure";
        RestartSec = 5;

        # It serves HTTP and sends mail, web push and the release check; it
        # needs nothing else.
        RestrictAddressFamilies = ["AF_INET" "AF_INET6" "AF_UNIX"];
        ProtectHome = true;
        ProtectSystem = "strict";
        PrivateTmp = true;
        PrivateDevices = true;
        DevicePolicy = "closed";
        PrivateUsers = true;
        PrivateIPC = true;
        ProtectProc = "invisible";
        ProcSubset = "pid";
        ProtectClock = true;
        ProtectHostname = true;
        ProtectKernelLogs = true;
        ProtectKernelModules = true;
        ProtectKernelTunables = true;
        ProtectControlGroups = true;
        CapabilityBoundingSet = "";
        NoNewPrivileges = true;
        RestrictNamespaces = true;
        RestrictRealtime = true;
        RestrictSUIDSGID = true;
        LockPersonality = true;
        RemoveIPC = true;
        SystemCallArchitectures = "native";
        SystemCallFilter = ["@system-service" "~@privileged"];
        SystemCallErrorNumber = "EPERM";
        UMask = "0077";
      };
    };

    networking.firewall.allowedTCPPorts = lib.mkIf cfg.openFirewall [cfg.port];
  };
}
