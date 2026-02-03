# Puvesoft POS - Flutter App

This folder boots the Flutter rewrite of the existing Angular POS. The goal is to match the current web functionality while adding full hardware support (fiscal printers, USB/Bluetooth scanners, camera) and offline-first sales.

## Backend
The production backend URL used by the Angular app is defined in `environment.prod.ts` and should be reused for Flutter:

- Base URL: `https://conexion.puvesoft.co/api`
- Host-specific overrides: `environment.prod.ts` maps `backendUrl` per hostname (e.g. `puvesoft.info`, `poscibertura.info`, `conectapos.info`).

## Environments
Use production settings (as requested). Avoid committing demo credentials in the repo.

## Scope
- Android, iOS, Windows.
- Hardware: fiscal printers, USB/Bluetooth scanners, camera.
- Offline: full sales workflow with sync when online.
- Permissions: hide/show UI and actions per user role.

See the architecture and migration plan in `docs/`.
