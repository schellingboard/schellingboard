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

Point the input at a release tag, `github:schellingboard/schellingboard/v<version>`, to choose when
the app changes under your attendees; the releases after 5.0.0 have the flake. To update, change the
tag and rebuild. Built from a release tag, the footer shows the release, and the admin sees the
[update notice](deployment.md#updating) when a newer one is out; built from any other commit, it
shows the commit.

The package is built with the nixpkgs the flake pins, which is the one its CI tests. To build it
with your system's nixpkgs instead, so that Node and libvips get the security fixes your system
gets, add `inputs.schellingboard.inputs.nixpkgs.follows = "nixpkgs";`.

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
`auth-secret`. The service runs as a dynamic user, so systemd keeps the directory at
`/var/lib/private/schellingboard` and links it to the usual path. Your `environmentFile` is not in
it; keep a copy of that with your system's configuration.

As [Backup and restore](backup.md) explains for Docker, never `cp` or `tar` a live `data.db`.
SQLite's own backup command takes a consistent snapshot while the site runs:

```bash
DIR=/var/lib/schellingboard
STAMP=$(date +%Y%m%d-%H%M%S)
sudo mkdir -p /root/backups
sudo nix shell nixpkgs#sqlite -c sqlite3 $DIR/data.db ".backup '/root/backups/data-$STAMP.db'"
sudo tar czf /root/backups/files-$STAMP.tar.gz -C $DIR --exclude='./data.db*' .
```

To restore, stop the service, put the files back, and give them to the service's user, which is
whoever owns the directory:

```bash
sudo systemctl stop schellingboard
sudo rm -rf $DIR/data.db $DIR/data.db-wal $DIR/data.db-shm $DIR/uploads
sudo cp /root/backups/data-$STAMP.db $DIR/data.db
sudo tar xzf /root/backups/files-$STAMP.tar.gz -C $DIR
sudo chown -R --reference=$DIR/ $DIR/
sudo systemctl start schellingboard
```

## A shell for working on it

The same flake has a development shell with Bun, Node, Make and SQLite:

```bash
nix develop
make install
make dev
```
