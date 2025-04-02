# Fix react-native-vlc-player

* patch `VLCPlayer.js`
* comment out line 148 `source.initOptions.push("--input-repeat=1000");`

# Using pnpm patch

```sh
pnpm patch react-native-vlc-media-player
code /Volumes/Kingston/git/cheunghing-greenwich/mobile/GreenwichApp/node_modules/.pnpm_patches/react-native-vlc-media-player@1.0.81
pnpm patch-commit '/Volumes/Kingston/git/cheunghing-greenwich/mobile/GreenwichApp/node_modules/.pnpm_patches/react-native-vlc-media-player@1.0.81'
```

