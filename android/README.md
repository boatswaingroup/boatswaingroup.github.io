# Boatswain Group Android build

The Android app is a Capacitor wrapper around the public Boatswain Group website.

## Build

The repository workflow `.github/workflows/boatswain-android-apk.yml` builds a debug APK on pushes to `main` that touch the website or this directory, and can also be run manually from GitHub Actions.

The workflow:
1. Copies the root `index.html` into the Capacitor web directory.
2. Generates the native Android project with Capacitor.
3. Builds and verifies the debug APK.
4. Uploads `boatswain-group-debug.apk` and its SHA-256 checksum as the `boatswain-group-android-apk` artifact.

The debug APK is for installation and testing, not a Play Store release. A signed release build needs a separately managed Android signing key and release workflow.

## Current integration scope

This package embeds the existing public website. Customer account, live inventory, reservations and payment flows are not represented as production-connected native features until the Boatswain API URL, database, authentication, and payment integrations have been configured and tested.
