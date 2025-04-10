# Variables
EXPO_PORT=8081
API_PORT=3000
NODE_MODULES = node_modules
PRISMA_CLIENT = node_modules/.prisma/client
PACKAGE_LOCK = package-lock.json

# Couleurs pour les logs
YELLOW := \033[1;33m
GREEN := \033[1;32m
RED := \033[1;31m
BLUE := \033[1;34m
NC := \033[0m
CLEAR := \033[2K
CURSOR_UP := \033[1A

# Commandes principales
.PHONY: all install start stop clean reset-db seed-db ports ports-kill

all: install start

# Gestion des ports
ports:
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║         PORTS ACTUELLEMENT UTILISÉS    ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	@echo "$(YELLOW)Recherche des processus sur les ports $(EXPO_PORT) et $(API_PORT)...$(NC)"
	@echo "\nPort $(EXPO_PORT) (Expo) :"
	@lsof -i :$(EXPO_PORT) || echo "$(GREEN)→ Port $(EXPO_PORT) libre$(NC)"
	@echo "\nPort $(API_PORT) (API) :"
	@lsof -i :$(API_PORT) || echo "$(GREEN)→ Port $(API_PORT) libre$(NC)"
	@echo "\n$(YELLOW)Pour libérer ces ports, utilisez : $(NC)make ports-kill"

ports-kill:
	@echo "$(RED)╔════════════════════════════════════════╗$(NC)"
	@echo "$(RED)║         LIBÉRATION DES PORTS           ║$(NC)"
	@echo "$(RED)╚════════════════════════════════════════╝$(NC)"
	@echo "$(YELLOW)Arrêt des processus sur le port $(EXPO_PORT)...$(NC)"
	-@lsof -ti :$(EXPO_PORT) | xargs kill -9 2>/dev/null || echo "$(GREEN)→ Aucun processus sur le port $(EXPO_PORT)$(NC)"
	@echo "$(YELLOW)Arrêt des processus sur le port $(API_PORT)...$(NC)"
	-@lsof -ti :$(API_PORT) | xargs kill -9 2>/dev/null || echo "$(GREEN)→ Aucun processus sur le port $(API_PORT)$(NC)"
	@echo "$(GREEN)✓ Tous les ports ont été libérés$(NC)"

# Installation des dépendances
install:
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║     INSTALLATION DES DÉPENDANCES       ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	@if [ ! -d "$(NODE_MODULES)" ] || [ ! -f "$(PACKAGE_LOCK)" ] || [ package.json -nt "$(PACKAGE_LOCK)" ]; then \
		echo "$(YELLOW)→ Installation des packages npm...$(NC)"; \
		npm install --legacy-peer-deps --no-audit --no-fund --prefer-offline --no-progress; \
	else \
		echo "$(GREEN)→ Les dépendances sont à jour$(NC)"; \
	fi
	@if [ ! -d "$(PRISMA_CLIENT)" ] || [ prisma/schema.prisma -nt "$(PRISMA_CLIENT)" ]; then \
		echo "$(YELLOW)→ Génération du client Prisma...$(NC)"; \
		npx prisma generate; \
	else \
		echo "$(GREEN)→ Client Prisma est à jour$(NC)"; \
	fi
	@echo "$(GREEN)✓ Installation terminée !$(NC)"

# Démarrage de l'application
start: ports start-server start-app

start-app:
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║      DÉMARRAGE DE L'APPLICATION        ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	npx expo start

start-web: ports start-server
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║    DÉMARRAGE DE L'APPLICATION WEB      ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	@echo "$(YELLOW)→ L'application sera accessible sur: $(NC)http://localhost:$(EXPO_PORT)"
	@echo "$(YELLOW)→ Mode debug activé pour plus de détails$(NC)"
	EXPO_PORT=$(EXPO_PORT) EXPO_DEBUG=true npx expo start --web

start-server:
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║        DÉMARRAGE DU SERVEUR           ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	@echo "$(YELLOW)→ Le serveur démarrera sur: $(NC)http://localhost:$(API_PORT)"
	npm run dev:server &

# Arrêt de l'application
stop: ports-kill
	@echo "$(RED)╔════════════════════════════════════════╗$(NC)"
	@echo "$(RED)║         ARRÊT DES PROCESSUS            ║$(NC)"
	@echo "$(RED)╚════════════════════════════════════════╝$(NC)"
	-pkill -f "node.*expo" || true
	-pkill -f "node.*server" || true
	@echo "$(GREEN)✓ Tous les processus ont été arrêtés$(NC)"

# Nettoyage
clean:
	@echo "$(YELLOW)╔════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║         NETTOYAGE DU PROJET           ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════╝$(NC)"
	@echo "→ Suppression de node_modules..."
	@rm -rf $(NODE_MODULES) package-lock.json
	@echo "→ Suppression des fichiers temporaires..."
	@rm -rf .expo dist build
	@echo "→ Suppression des fichiers de base de données..."
	@rm -rf prisma/*.db
	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"

# Base de données
.PHONY: db-setup db-migrate db-reset db-seed db-studio

db-setup: db-migrate db-seed

db-migrate:
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║      MIGRATION DE LA BASE DE DONNÉES   ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	npm run prisma:migrate

db-reset:
	@echo "$(RED)╔════════════════════════════════════════╗$(NC)"
	@echo "$(RED)║   RÉINITIALISATION DE LA BASE DE DONNÉES║$(NC)"
	@echo "$(RED)╚════════════════════════════════════════╝$(NC)"
	npx prisma migrate reset --force

db-seed:
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║    GÉNÉRATION DES DONNÉES DE TEST      ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	npm run prisma:seed

db-studio:
	@echo "🔍 Ouverture de Prisma Studio..."
	npx prisma studio

# Commandes de développement
.PHONY: dev dev-web lint test

dev: start

dev-web: install db-setup start-web

lint:
	@echo "🔍 Vérification du code..."
	npm run lint

test:
	@echo "🧪 Exécution des tests..."
	npm test

# Configuration initiale
setup: install db-setup

# Génération du client Prisma
generate-prisma:
	@echo "🔧 Génération du client Prisma..."
	npm run prisma:generate

# Migration de la base de données
migrate-db:
	@echo "🔄 Application des migrations..."
	npm run prisma:migrate

# Alimentation de la base de données
seed-db:
	@echo "🌱 Génération des données de test..."
	npm run prisma:seed

# Aide
.PHONY: help
help:
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║           COMMANDES DISPONIBLES        ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	@echo "$(YELLOW)Gestion des ports :$(NC)"
	@echo "  make ports      : Liste les ports utilisés"
	@echo "  make ports-kill : Force la fermeture des ports utilisés"
	@echo ""
	@echo "$(YELLOW)Installation et configuration :$(NC)"
	@echo "  make install     : Installe toutes les dépendances"
	@echo "  make clean      : Nettoie le projet"
	@echo "  make setup      : Configuration complète (install + db)"
	@echo ""
	@echo "$(YELLOW)Démarrage de l'application :$(NC)"
	@echo "  make start      : Démarre l'application mobile"
	@echo "  make start-web  : Démarre l'application web"
	@echo "  make dev-web    : Installation complète + démarrage web"
	@echo "  make stop       : Arrête tous les processus"
	@echo ""
	@echo "$(YELLOW)Base de données :$(NC)"
	@echo "  make db-setup   : Configure la base de données"
	@echo "  make db-migrate : Applique les migrations"
	@echo "  make db-reset   : Réinitialise la base de données"
	@echo "  make db-seed    : Génère les données de test"
	@echo "  make db-studio  : Ouvre Prisma Studio" 