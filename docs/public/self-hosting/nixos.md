---
title: "NixOS"
description: "Run SchellingBoard as a NixOS service, built from source by the repository's flake."
type: guide
---

# NixOS

The repository is a Nix flake. It builds SchellingBoard from source and has a NixOS module that runs
it as a system service: started at boot, restarted if it fails, logging to the journal, sandboxed,
and with all its data in one directory you can back up.

## Add it to your system

```nix
{
  inputs.schellingboard.url = "github:schellingboard/schellingboard";

  outputs = { nixpkgs, schellingboard, ... }: {
    nixosConfigurations.venue = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        schellingboard.nixosModules.default
        {
          services.schellingboard = {
            enable = true;
            settings.SITE_URL = "https://sessions.example.org";
          };
        }
      ];
    };
  };
}
```

Point the input at a release tag, e.g. `github:schellingboard/schellingboard/v5.0.0`, to choose when
the app changes under your attendees. `nix flake update schellingboard` moves it.

The flake also has `packages.<system>.default` (Linux only) and `overlays.default`, which adds
`pkgs.schellingboard`.

## Settings and secrets

`services.schellingboard.settings` takes the environment variables from
[Configuration](configuration.md), except the secret ones. Those end up in the Nix store, which
every user on the machine can read, so `SITE_PASSWORD`, `AUTH_SECRET`, `SMTP_PASSWORD` and
`SMTP_URL` go in `environmentFile` instead: a file of `NAME=value` lines placed by your secret
manager or by hand with mode `0400`. The module refuses to build if one of them is in `settings`.

```nix
services.schellingboard.environmentFile = "/run/secrets/schellingboard";
```

You don't need to set `AUTH_SECRET`: without one, the service generates it on the first start and
keeps it in `/var/lib/schellingboard/auth-secret`.

## The first site admin

On its first start the app logs a one-time link that makes whoever opens it a site admin:

```bash
journalctl -u schellingboard | grep -i admin
```

## Serve it over HTTPS

The app listens on `services.schellingboard.port` (3000) on every address, and the firewall keeps
that port closed. Put a reverse proxy in front of it: adding the site to a phone's home screen, and
the notifications that come with it, only work on an `https://` address.

```nix
services.schellingboard.settings.SB_TRUSTED_PROXIES = "1";

services.nginx = {
  enable = true;
  # Passes X-Forwarded-For and X-Forwarded-Proto, which the app needs.
  recommendedProxySettings = true;
  virtualHosts."sessions.example.org" = {
    enableACME = true;
    forceSSL = true;
    locations."/".proxyPass = "http://127.0.0.1:3000";
  };
};
```

`SB_TRUSTED_PROXIES` tells the app how many proxies stand in front of it, so that it limits failed
logins per visitor; see [Behind a reverse proxy](configuration.md#behind-a-reverse-proxy).

Set `services.schellingboard.openFirewall` instead to reach the app directly, such as a laptop on
the venue's wifi for a trial run, where installing to the home screen is not wanted.

## Data and backups

Everything is in `/var/lib/schellingboard`: `data.db`, the uploaded files, and the generated
`auth-secret`. Back that directory up as [Backup and restore](backup.md) describes. The service runs
as a dynamic user, so systemd keeps the directory at `/var/lib/private/schellingboard` and links it
to the usual path.

## A shell for working on it

The same flake has a development shell with Bun, Node and what the native addons need to compile:

```bash
nix develop
make install
make dev
```
