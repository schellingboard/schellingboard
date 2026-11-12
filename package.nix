# SchellingBoard built from source, as the Dockerfile builds it.
#
# bun2nix installs node_modules with bun itself, from a cache of the packages
# bun.lock names. Its CLI would write that list to a bun.nix to commit; here it
# is read from bun.lock as the flake is evaluated, every package fetched by the
# integrity hash the lockfile records. So there is no generated file or
# dependency hash to keep in step with Dependabot; a bump to bun.lock is all a
# new dependency needs.
{
  lib,
  stdenv,
  bun2nix,
  nodejs,
  node-gyp,
  python3,
  pkg-config,
  vips,
  makeWrapper,
  autoPatchelfHook,
  # The commit, for the version the footer shows; the flake passes it.
  appVersion ? "",
}: let
  # bun.lock is JSON with trailing commas, which builtins.fromJSON refuses.
  lockText = builtins.readFile ./bun.lock;
  lock = builtins.fromJSON (lib.concatMapStrings (part:
    if builtins.isList part
    then builtins.head part
    else part)
  (builtins.split ",([[:space:]]*[]}])" lockText));

  # The changelog's headings, newest first, e.g. ["Unreleased" "5.0.0" ...].
  headings = lib.concatMap (line: let
    m = builtins.match "## [[]([^]]+)[]].*" line;
  in
    lib.optionals (m != null) m) (lib.splitString "\n" (builtins.readFile ./CHANGELOG.md));
  isRelease = heading: builtins.match "[0-9]+[.][0-9]+[.][0-9]+" heading != null;
  version = lib.findFirst isRelease "0.0.0" headings;

  # Only a release commit has no Unreleased heading. It shows the tag, as the
  # Docker image does; the admin's update notice only understands a tag.
  footerVersion =
    if headings != [] && isRelease (builtins.head headings)
    then "v${version}"
    else appVersion;

  # What .dockerignore leaves out, so local databases, env files and the
  # .jj store of a checkout without .git neither rebuild it nor reach the
  # store.
  source = lib.fileset.difference ./. (lib.fileset.unions ([
      (lib.fileset.maybeMissing ./node_modules)
      (lib.fileset.maybeMissing ./dist)
      (lib.fileset.maybeMissing ./apps/web/dist)
      (lib.fileset.maybeMissing ./apps/web/node_modules)
      (lib.fileset.maybeMissing ./.git)
      (lib.fileset.maybeMissing ./.jj)
      (lib.fileset.maybeMissing ./.flake-hunt)
      (lib.fileset.maybeMissing ./.e2e-docker)
      (lib.fileset.maybeMissing ./coverage)
      (lib.fileset.maybeMissing ./site)
      ./flake.lock
    ]
    ++ map (name: ./. + "/${name}") (lib.filter (name:
      builtins.match "[.]env.*[.]local|[.]env[.]test|.*[.]nix|.*[.]db(-shm|-wal|-journal)?" name != null)
    (builtins.attrNames (builtins.readDir ./.)))));
  src = lib.fileset.toSource {
    root = ./.;
    fileset = source;
  };

  # npm's names for this platform; bun.lock tags platform packages with them.
  os = stdenv.hostPlatform.parsed.kernel.name;
  cpu = let
    name = stdenv.hostPlatform.parsed.cpu.name;
    npm = {
      x86_64 = "x64";
      aarch64 = "arm64";
    };
  in
    lib.attrByPath [name] name npm;
  fits = want: field:
    want
    == null
    || (let
      list = lib.toList want;
      denied = map (lib.removePrefix "!") (lib.filter (lib.hasPrefix "!") list);
      allowed = lib.filter (x: !lib.hasPrefix "!" x) list;
    in
      !(lib.elem field denied) && (allowed == [] || lib.elem field allowed));

  # bun.lock's packages as bun2nix's bun.nix lists them: a workspace by its
  # name, an npm package by its name@version. Of the native packages only this
  # platform's builds: bun skips other systems' and wasm fallbacks (os
  # "none"). musl builds carry no libc tag in bun.lock, only their name, so
  # bun tries those too and warns that it could not download them; they would
  # only leave autoPatchelf a libc it cannot find. bun2nix's CLI also handles
  # git, tarball and file dependencies; this has no need to yet, and refuses
  # them.
  bunNix = {fetchurl, ...}:
    lib.listToAttrs (lib.concatLists (lib.mapAttrsToList (key: value: let
      ident = builtins.head value;
      meta =
        if builtins.length value > 2 && builtins.isAttrs (builtins.elemAt value 2)
        then builtins.elemAt value 2
        else {};
      at = lib.splitString "@" (lib.removePrefix "@" ident);
      name = (lib.optionalString (lib.hasPrefix "@" ident) "@") + builtins.head at;
      spec = lib.concatStringsSep "@" (builtins.tail at);
      registry = builtins.elemAt value 1;
      wanted =
        fits (meta.os or null) os
        && fits (meta.cpu or null) cpu
        && !(stdenv.hostPlatform.isGnu && lib.hasInfix "musl" name);
    in
      if lib.hasPrefix "workspace:" spec
      then let
        dir = ./. + "/${lib.removePrefix "workspace:" spec}";
      in [
        (lib.nameValuePair key (lib.fileset.toSource {
          root = dir;
          fileset = lib.fileset.intersection source dir;
        }))
      ]
      else if builtins.length value != 4
      then throw "bun.lock: ${ident} is not from a registry; generate a bun.nix with bun2nix's CLI instead"
      else
        lib.optional wanted (lib.nameValuePair ident (fetchurl {
          url =
            if registry != ""
            then registry
            else "https://registry.npmjs.org/${name}/-/${lib.last (lib.splitString "/" name)}-${spec}.tgz";
          hash = lib.last value;
        })))
    (lock.packages or {})));
in
  stdenv.mkDerivation {
    pname = "schellingboard";
    inherit version;

    inherit src;

    nativeBuildInputs = [bun2nix.hook nodejs node-gyp python3 pkg-config makeWrapper autoPatchelfHook];
    # The prebuilt build tools (rolldown, lightningcss, tailwind) link against
    # the C++ runtime; sharp is built against nixpkgs' libvips.
    buildInputs = [stdenv.cc.cc.lib vips];

    bunDeps = bun2nix.fetchBunDeps {
      inherit bunNix;
      # Scripts keep running on Node, as in the Docker image.
      useFakeNode = false;
    };
    # The layout the Dockerfile's `bun install` makes, which the install
    # phase copies from.
    bunInstallFlags = ["--frozen-lockfile" "--linker=hoisted"];
    # As in the Docker image, no dependency's install script runs; the native
    # addons are built below.
    dontRunLifecycleScripts = true;

    postBunNodeModulesInstallPhase = ''
      chmod -R u+w node_modules
      # Both native addons are built from source below. better-sqlite3's
      # build does nothing while a prebuilt copy for the host is there, and
      # sharp's bring their own libvips.
      rm -rf node_modules/better-sqlite3/prebuilds node_modules/@img/sharp-*
      # Their own binaries have to run during the build, before fixup would
      # patch them.
      autoPatchelf node_modules
    '';

    buildPhase = ''
      runHook preBuild
      export APP_VERSION=${lib.escapeShellArg footerVersion}
      node node_modules/vite/bin/vite.js build apps/web
      bun scripts/build-server.ts

      # The native addons: better-sqlite3 with the SQLite it bundles, sharp
      # against the libvips found by pkg-config.
      (cd node_modules/better-sqlite3 && node-gyp rebuild --nodedir=${nodejs})
      (cd node_modules/sharp && node-gyp rebuild --directory=src --nodedir=${nodejs})
      runHook postBuild
    '';

    # The same files the Docker image's runner stage copies.
    installPhase = ''
      runHook preInstall
      app=$out/share/schellingboard
      mkdir -p $app/apps/web $app/node_modules/@scalar/api-reference/dist/browser
      cp -r dist public drizzle $app/
      cp -r apps/web/dist $app/apps/web/
      for m in better-sqlite3 sharp @img detect-libc semver; do
        cp -r node_modules/$m $app/node_modules/
      done
      # Of each addon's build, only the addon itself is loaded.
      rm -rf $app/node_modules/better-sqlite3/{deps,src} $app/node_modules/better-sqlite3/build/Release/test_extension.node
      find $app/node_modules/sharp/src -mindepth 1 -maxdepth 1 ! -name build -exec rm -rf {} +
      for build in $app/node_modules/better-sqlite3/build $app/node_modules/sharp/src/build; do
        find $build -mindepth 1 -maxdepth 1 ! -name Release -exec rm -rf {} +
        find $build/Release -mindepth 1 -maxdepth 1 ! -name '*.node' -exec rm -rf {} +
      done
      cp node_modules/@scalar/api-reference/dist/browser/standalone.js \
        $app/node_modules/@scalar/api-reference/dist/browser/

      # It reads public/, apps/web/dist and drizzle/ from its working directory.
      makeWrapper ${lib.getExe nodejs} $out/bin/schellingboard \
        --chdir $app \
        --set-default NODE_ENV production \
        --add-flags $app/dist/server/main.mjs
      runHook postInstall
    '';

    passthru = {inherit nodejs;};

    meta = {
      description = "Scheduling app for participant-driven events: propose sessions, vote, and build the schedule";
      homepage = "https://schellingboard.org";
      license = lib.licenses.mit;
      mainProgram = "schellingboard";
      platforms = lib.platforms.linux;
    };
  }
