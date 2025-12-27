# Installation du Nouveau Système de Calendrier

## Backend - Dépendances Python

```bash
cd backend
pip install google-api-python-client==2.147.0
pip install google-auth-httplib2==0.2.0
pip install google-auth-oauthlib==1.2.1
```

Ou simplement :
```bash
cd backend
pip install -r requirements.txt
```

## Frontend - Dépendances NPM

```bash
npm install react-big-calendar moment
```

## Configuration Google Calendar API

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer l'API Google Calendar
4. Créer des identifiants OAuth 2.0
5. Télécharger le fichier JSON des identifiants

6. Ajouter ces variables dans votre fichier `.env` backend :

```env
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## Réinitialiser la Base de Données

Les modèles ont été mis à jour pour supporter :
- Cours avec plusieurs élèves (groupes/binômes)
- Trames de cours (templates réutilisables)
- Intégration Google Calendar
- Champs Google OAuth dans User

```bash
cd backend
python3 init_db.py
```

## Démarrer l'Application

### Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
npm run dev
```

## Nouvelles Fonctionnalités

### 1. Calendrier Google-like
- Vue mensuelle, hebdomadaire et journalière
- Interface ultra-moderne et responsive
- Création de cours par glisser-déposer
- Support multi-élèves (cours en groupe)

### 2. Intégration Google Calendar
- Synchronisation bidirectionnelle
- Les cours créés dans Maraakiz apparaissent dans Google Calendar
- OAuth 2.0 sécurisé
- Bouton de connexion/déconnexion

### 3. Trames de Cours
- Templates de cours réutilisables
- Gain de temps pour les cours répétitifs
- Structure prédéfinie (plan, objectifs, ressources)

### 4. Cours en Groupe
- Plusieurs élèves par cours
- Support binômes et groupes
- Présence individuelle par élève

## API Endpoints

### Calendrier
- `GET /api/calendrier/cours` - Liste des cours
- `POST /api/calendrier/cours` - Créer un cours
- `PUT /api/calendrier/cours/{id}` - Modifier un cours
- `DELETE /api/calendrier/cours/{id}` - Supprimer un cours

### Google Calendar
- `GET /api/calendrier/google/auth-url` - URL d'authentification
- `POST /api/calendrier/google/callback` - Callback OAuth
- `POST /api/calendrier/google/disconnect` - Déconnexion
- `GET /api/calendrier/google/status` - Statut de connexion

### Trames de Cours
- `GET /api/calendrier/trames` - Liste des trames
- `POST /api/calendrier/trames` - Créer une trame
- `DELETE /api/calendrier/trames/{id}` - Supprimer une trame

## Prochaines Étapes

Les fonctionnalités suivantes sont prêtes à être implémentées :
- [ ] Upload de fichiers de cours (audio/vidéo)
- [ ] Quiz et tests de connaissances
- [ ] Bloc-notes élève
- [ ] Système freemium
- [ ] Dashboard interactif avec paiements
- [ ] Simplification des notes de cours
