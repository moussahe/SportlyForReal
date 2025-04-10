#!/bin/bash

# Obtenir le chemin absolu du dossier SportlyApp
SPORTLY_PATH="/Users/moussahe/Documents/Sportly_test/SportlyApp"

# Vérifier si nous sommes dans le bon dossier
if [ "$PWD" != "$SPORTLY_PATH" ]; then
    echo "⚠️  ATTENTION: Vous n'êtes pas dans le bon dossier!"
    echo "Dossier actuel: $PWD"
    echo "Dossier requis: $SPORTLY_PATH"
    echo "Changement automatique vers le bon dossier..."
    cd "$SPORTLY_PATH"
    if [ $? -eq 0 ]; then
        echo "✅ Changement de dossier réussi!"
    else
        echo "❌ Erreur lors du changement de dossier!"
        exit 1
    fi
fi

echo "✅ Dossier de travail correct: $PWD" 