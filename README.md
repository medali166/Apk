# Task Tracker (Vite + React) + Capacitor

## But
Ce projet contient une application React (Tracker de tâches) prête à être empaquetée en APK via Capacitor.

## Instructions rapides
1. Extrais le ZIP.
2. Crée un repo GitHub et pousse le contenu.
3. Sur GitHub, la workflow `Build Android APK (Capacitor)` s'exécutera et produira un artifact `app-debug-apk` contenant `app-debug.apk`.
4. Télécharge l'APK depuis l'onglet Actions > exécution > Artifacts.

## Remarques
- Le workflow construit un APK **debug** (non signé pour Play Store). Pour un APK signé (release), fournis un keystore et on adaptera le workflow pour signer l'APK.
- Si `npx cap add android` échoue sur la CI parce que le répertoire `android/` existe déjà, la commande est tolérante (`|| true`) et on continue. Si tu veux forcer la régénération, supprime le dossier android avant d'exécuter `npx cap add android`.
