# WildSight mobile app

This is the Expo SDK 57 client for WildSight. The complete architecture, setup steps, backend configuration, verification commands and device checklist are in the repository-level [`README.md`](../README.md).

Quick start:

```bash
cp ../.env.example .env
# Edit EXPO_PUBLIC_API_URL to use your computer's LAN address.
npm install
npm start
```

Do not place AWS credentials or `OPENAI_API_KEY` in this directory. Expo variables prefixed with `EXPO_PUBLIC_` are compiled into the mobile bundle and are visible to users.

Without `EXPO_PUBLIC_API_URL`, open **Try bundled demo** on the welcome screen.

