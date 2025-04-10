# 🏃‍♂️ Sportly

Application mobile de mise en relation pour les activités sportives, permettant aux utilisateurs de créer, rejoindre et gérer des sessions sportives.

## 📱 Fonctionnalités

- **Sessions Sportives**
  - Création de sessions sportives
  - Recherche de sessions par proximité
  - Gestion des équipes et des participants
  - Statuts des sessions (À venir, En cours, Terminé)

- **Gestion des Équipes**
  - Création d'équipes
  - Rejoindre/Quitter une équipe
  - Affichage des membres

- **Chat en Temps Réel**
  - Discussion dans le lobby
  - Chat par équipe
  - Notifications

## 🛠 Technologies Utilisées

- **Frontend**
  - React Native
  - TypeScript
  - Redux Toolkit
  - React Navigation
  - Expo

- **Backend**
  - Node.js
  - Express
  - Prisma
  - PostgreSQL

## 💡 Explications des Technologies

### Frontend

- **React Native**
  - Framework pour créer des applications mobiles natives
  - Permet d'écrire une seule fois le code pour iOS et Android
  - Utilise des composants natifs pour de meilleures performances

- **TypeScript**
  - Version de JavaScript avec des types
  - Aide à éviter les erreurs avant l'exécution
  - Améliore l'auto-complétion dans l'éditeur

- **Redux Toolkit**
  - Gère l'état global de l'application
  - Stocke les données des sessions, utilisateurs et chats
  - Synchronise les données entre les écrans

- **React Navigation**
  - Gère la navigation entre les écrans
  - Maintient l'historique de navigation
  - Permet les transitions fluides

- **Expo**
  - Simplifie le développement React Native
  - Fournit des outils de développement
  - Permet de tester facilement sur mobile

### Backend

- **Node.js**
  - Environnement d'exécution JavaScript
  - Gère le serveur de l'application
  - Traite les requêtes des utilisateurs

- **Express**
  - Framework web pour Node.js
  - Gère les routes API
  - Traite les requêtes HTTP

- **Prisma**
  - ORM (Object-Relational Mapping)
  - Gère la base de données de façon type-safe
  - Simplifie les requêtes à la base de données

- **PostgreSQL**
  - Base de données relationnelle
  - Stocke toutes les données de l'application
  - Gère les relations entre les données

### Cas d'Utilisation

1. **Création d'une Session**
   - Frontend : Formulaire React Native
   - Redux : Stocke la nouvelle session
   - Express : Reçoit la requête
   - Prisma : Sauvegarde dans PostgreSQL

2. **Rejoindre une Équipe**
   - React Navigation : Affiche l'écran de lobby
   - Redux : Met à jour l'état
   - Express : Traite la demande
   - Prisma : Met à jour les relations

3. **Chat en Temps Réel**
   - React Native : Interface utilisateur
   - Redux : Gère les messages
   - Node.js : Traite les messages
   - PostgreSQL : Stocke l'historique

## 🚀 Installation

### Prérequis

- Node.js (v18+)
- PostgreSQL
- npm ou yarn
- Expo CLI

### Configuration de l'environnement

1. Cloner le repository
```bash
git clone https://github.com/moussahe/SportlyForReal.git
cd SportlyForReal
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Modifier le fichier `.env` avec vos configurations :
```
DATABASE_URL="postgresql://user:password@localhost:5432/sportly_db"
```

4. Initialiser la base de données
```bash
npx prisma migrate dev
npx prisma db seed
```

### Lancement de l'application

1. Démarrer le serveur backend
```bash
npm run server
```

2. Démarrer l'application React Native
```bash
npm run start
```

## 🔧 Commandes Make

Le projet utilise un Makefile pour simplifier les opérations courantes. Voici les principales commandes disponibles :

### Gestion de l'Application

- `make install` : Installe toutes les dépendances
- `make start` : Démarre l'application mobile et le serveur
- `make start-web` : Démarre l'application en mode web
- `make stop` : Arrête tous les processus
- `make clean` : Nettoie le projet (node_modules, builds, etc.)

### Base de Données

- `make db-setup` : Configure la base de données (migration + seed)
- `make db-migrate` : Applique les migrations Prisma
- `make db-reset` : Réinitialise la base de données
- `make db-seed` : Génère les données de test
- `make db-studio` : Ouvre Prisma Studio

### Développement

- `make dev` : Lance l'application en mode développement
- `make dev-web` : Installation complète + démarrage web
- `make lint` : Vérifie le code avec ESLint
- `make test` : Lance les tests

### Utilitaires

- `make ports` : Liste les ports utilisés
- `make ports-kill` : Force la fermeture des ports utilisés
- `make help` : Affiche l'aide avec toutes les commandes disponibles

Pour voir toutes les commandes disponibles :
```bash
make help
```

## 📱 Utilisation

### Création d'une Session

1. Cliquer sur le bouton "+" dans l'écran d'accueil
2. Remplir les informations de la session :
   - Sport
   - Date et heure
   - Lieu
   - Nombre de joueurs
   - Niveau requis

### Rejoindre une Session

1. Parcourir les sessions disponibles sur l'écran d'accueil
2. Cliquer sur une session pour voir les détails
3. Rejoindre une équipe disponible

### Gestion des Équipes

- Pour rejoindre : Cliquer sur "Rejoindre l'équipe"
- Pour quitter : Cliquer sur "Quitter l'équipe"
- Les équipes sont automatiquement équilibrées

## 👥 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forker le projet
2. Créer une branche pour votre fonctionnalité
```bash
git checkout -b feat/nom-de-la-fonctionnalite
```
3. Commiter vos changements
```bash
git commit -m "feat: description de la fonctionnalité"
```
4. Pousser vers la branche
```bash
git push origin feat/nom-de-la-fonctionnalite
```
5. Ouvrir une Pull Request

### Convention de Commits

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Mise en forme du code
- `refactor:` Refactorisation du code
- `test:` Ajout ou modification de tests
- `chore:` Tâches diverses

## 📝 Structure du Projet

```
sportly/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── screens/       # Écrans de l'application
│   ├── navigation/    # Configuration de la navigation
│   ├── store/         # État global (Redux)
│   ├── utils/         # Fonctions utilitaires
│   └── types/         # Types TypeScript
├── backend/
│   ├── controllers/   # Contrôleurs API
│   ├── routes/        # Routes API
│   └── middleware/    # Middleware Express
└── prisma/
    ├── schema.prisma  # Schéma de base de données
    └── seed.ts        # Données de test
```

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à :
- Ouvrir une issue
- Me contacter par email : [moussa.he@gmail.com](mailto:moussa.he@gmail.com) 
