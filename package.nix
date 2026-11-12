# SchellingBoard built from source, as the Dockerfile builds it.
#
# node_modules comes from bun.lock: every package is fetched by the integrity
# hash the lockfile already records, and unpacked where bun.lock's key says it
# lives. So there is no dependency hash to keep in step with Dependabot; a bump
# to bun.lock is all a new dependency needs.
{
  lib,
  stdenv,
  fetchurl,
  writeText,
  bun,
  nodejs,
  node-gyp,
  python3,
  pkg-config,
  vips,
  makeWrapper,
  autoPatchelfHook,
  # The version the footer shows; the flake passes the commit.
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

  # One entry per bun.lock package: where it goes, what it is, how to get it.
  entries = lib.mapAttrsToList (key: value: let
    ident = builtins.head value;
    meta =
      if builtins.length value > 2 && builtins.isAttrs (builtins.elemAt value 2)
      then builtins.elemAt value 2
      else {};
    at = lib.splitString "@" (lib.removePrefix "@" ident);
    name = (lib.optionalString (lib.hasPrefix "@" ident) "@") + builtins.head at;
    spec = lib.concatStringsSep "@" (builtins.tail at);
    # "a/@s/b/c" is node_modules/a/node_modules/@s/b/node_modules/c.
    segments = let
      go = parts:
        if parts == []
        then []
        else if lib.hasPrefix "@" (builtins.head parts)
        then ["${builtins.head parts}/${builtins.elemAt parts 1}"] ++ go (lib.drop 2 parts)
        else [(builtins.head parts)] ++ go (builtins.tail parts);
    in
      go (lib.splitString "/" key);
  in {
    inherit name meta segments;
    path = "node_modules/" + lib.concatStringsSep "/node_modules/" segments;
    workspace = lib.removePrefix "workspace:" spec;
    isWorkspace = lib.hasPrefix "workspace:" spec;
    integrity = lib.last value;
    version = spec;
  }) (lock.packages or {});

  # Only this platform's builds of the native packages. musl builds carry no
  # libc tag in bun.lock, only their name; wasm fallbacks say os "none".
  wanted = e:
    e.isWorkspace
    || (fits (e.meta.os or null) os
      && fits (e.meta.cpu or null) cpu
      && !(stdenv.hostPlatform.isGnu && lib.hasInfix "musl" e.name));

  installs = lib.filter wanted entries;

  tarball = e:
    fetchurl {
      url = "https://registry.npmjs.org/${e.name}/-/${lib.last (lib.splitString "/" e.name)}-${e.version}.tgz";
      hash = e.integrity;
    };

  # Workspaces first: a workspace's own nested dependencies are unpacked
  # through its link. Shallower paths before deeper ones for the same reason.
  ordered = lib.sort (a: b:
    if a.isWorkspace != b.isWorkspace
    then a.isWorkspace
    else builtins.length a.segments < builtins.length b.segments)
  installs;

  bins = e: let
    bin = e.meta.bin or {};
  in
    if builtins.isString bin
    then {${lib.last (lib.splitString "/" e.name)} = bin;}
    else bin;

  # Command-line tools at the top level, for the build steps below.
  linkBins = e:
    lib.optionalString (builtins.length e.segments == 1) (lib.concatStrings (lib.mapAttrsToList (bin: file: ''
        mkdir -p node_modules/.bin
        chmod +x ${e.path}/${file}
        ln -sf ../${builtins.head e.segments}/${file} node_modules/.bin/${bin}
      '')
      (bins e)));

  unpack = e:
    if e.isWorkspace
    then ''
      mkdir -p "$(dirname ${e.path})"
      ln -s "$PWD/${e.workspace}" ${e.path}
    ''
    else
      ''
        mkdir -p ${e.path}
        tar xzf ${tarball e} --strip-components=1 --no-same-owner -C ${e.path}
      ''
      + linkBins e;

  # A file of its own: inline, a thousand packages are more than the kernel
  # lets one environment variable hold.
  unpackNodeModules = writeText "unpack-node-modules.sh" (lib.concatMapStrings unpack ordered);
in
  stdenv.mkDerivation {
    pname = "schellingboard";
    inherit version;

    src = lib.fileset.toSource {
      root = ./.;
      # What .dockerignore leaves out, so local databases, env files and the
      # .jj store of a checkout without .git neither rebuild it nor reach the
      # store.
      fileset = lib.fileset.difference ./. (lib.fileset.unions ([
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
    };

    nativeBuildInputs = [bun nodejs node-gyp python3 pkg-config makeWrapper autoPatchelfHook];
    # The prebuilt build tools (rolldown, lightningcss, tailwind) link against
    # the C++ runtime; sharp is built against nixpkgs' libvips.
    buildInputs = [stdenv.cc.cc.lib vips];

    configurePhase = ''
      runHook preConfigure
      export HOME=$TMPDIR
      source ${unpackNodeModules}
      chmod -R u+w node_modules
      # Both native addons are built from source below. better-sqlite3's
      # build does nothing while a prebuilt copy for the host is there, and
      # sharp's bring their own libvips.
      rm -rf node_modules/better-sqlite3/prebuilds node_modules/@img/sharp-*
      patchShebangs node_modules
      # Their own binaries have to run during the build, before fixup would
      # patch them.
      autoPatchelf node_modules
      runHook postConfigure
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
