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
- Me contacter par email : [moussa.hechaichi@gmail.com](mailto:moussa.hechaichi@gmail.com) 