# Demi-fond N'EPS

CA1 · Demi-fond · performance auto-référencée · Quentin Delisle · socle N'EPS 1.3.0 · **v2.7.0**

## Fichiers

| Fichier | Rôle |
|---|---|
| `activite.js` | configuration (synthèse par leçon : VMA, distance, cibles, piliers, abandons, méthode) |
| `df-core.js` | piste, programmation multi-exercices, VMA de référence, piliers, comptes à rebours, fusion des saisies |
| `df-exos.js` | écrans : test VMA (demi-Cooper ou VAMEVAL) / Bats tes perfs, course d'équipe, pelotons, fractionnés, évaluation 3 × 500 m |
| `df-aventuriers.js`, `df-plateau.js`, `aventuriers/plateau_44.jpg`, `plateau_france.jpg`, `plateau_europe.jpg` | Run Express (ex-« Les Aventuriers du … ») : plateau au choix Loire-Atlantique, France, Europe |
| `df-jeux.js` | sons et voix de la tablette, 🧟 Zombie Frac' |
| `df-kart.js` | 🏎️ Kart'Endurance |
| `df-loups.js` | 🐺 Gare aux loups |
| `df-prof.js` | espace enseignant : programmation, VMA, piliers enseignant, bilan, évaluation par blocs |
| `df-fiches.js` | fiches 📖 des exercices (rédigées pour les élèves de seconde ; fractionnés : schéma de la piste avec les plots de couleur calculés d'après la VMA des élèves), classe de démonstration, styles |
| le reste | socle N'EPS (inchangé) |

`specifique.js` (v1) n'est plus utilisé : il peut être supprimé du dépôt.

## Piste

Espace enseignant → ⚙️ **Paramètres du cycle** (tout le cycle : nombre de leçons, piste, forme de saisie des piliers, jokers) · 🗺️ **Programmation des leçons** (chaque leçon : exercices et réglages, équipes, parcours, pilier(s) observé(s), leçon d'évaluation). Piste : piste circulaire (1 tour = longueur) ou couloir en aller-retour (1 tour = 2 × longueur).
Tour impossible au-delà de 26 km/h. Demi-Cooper : un plot tous les ≈ 50 m, numérotés en continu ; on ne compte pas les tours sur la tablette, on place chaque élève sur la case de son plot d'arrêt (8 à 40 ; plot n = n ÷ 2 km/h avec 50 m).

## Cycle par défaut (1 à 4 exercices par leçon, modifiable)

| Leçon | Exercices |
|---|---|
| L1 | ⏱️ Test VMA (demi-Cooper) + 🤝 Course d'équipe |
| L2 | ⚡ Fractionné court 30/30 + 🚂 Run Express |
| L3 | 🔥 Bats tes perfs + 🐇 Course en pelotons |
| L4 | 🔁 Fractionné long 4 × 3 min + 🚂 Run Express |
| L5 | ⚡ Pyramide 15-30-45-30-15 s + 🤝 Course d'équipe |
| L6 | 🔁 Fractionné long 3 × 1000 m + 🐇 Course en pelotons |
| L7 | ⚡ 8 × 200 m + 🐇 Course en pelotons |
| L8 | 📝 Évaluation 3 × 500 m |

## Barèmes

- **Bats tes perfs /6** (progrès de VMA) : moins bien → 1 (plus de 1 km/h perdu) ou 2 · même VMA (−0,25 à +0,4) → 3 · +0,5 à 1,4 → 4 · +1,5 à 2,4 → 5 · +2,5 et plus → 6.
- **Pelotons /10 par course** : % de VMA (135 % et plus = 5, −0,5 par tranche de 5 %) + points du joker validé ; au-delà de 10, report sur la course suivante.
- **Test VMA** : demi-Cooper (6 min, VMA = distance ÷ 100) ou VAMEVAL (paliers d'1 min, +0,5 km/h, un bip par plot ≈ 20 m ; VMA = dernier palier terminé), au choix dans la Programmation.
- **Run Express** : plateau au choix ; 1 tronçon = distance réglée en mètres (par défaut 1 tour) ; trajets 1 → 1 pt, 2 → 2, 3 → 4, 4 → 7, 5 → 10 ; parcours relié = sa valeur (plus court chemin en tronçons) ; +10 plus de villes, +10 plus de parcours (égalité : le premier) ; trinômes × coefficient s'il y a aussi des binômes.
- **Évaluation (blocs séparés)** : AFL1 3 × 500 m /12 (3 pts par course selon le % de VMA : 110 % = 3 · 105 = 2,5 · 100 = 2 · 95 = 1,5 · 90 = 1 · 85 = 0,5 ; régularité /3 : −0,5 par tranche de 4 s d'écart entre deux courses) · Bats tes perfs /6 · 🔴 **Fil rouge · Investissement /6** = coureur /3 (exercices sans abandon, cibles des fractionnés) + observateur /3 (observations faites, accord avec l'enseignant) · 🔵 **Fil bleu · Piliers /6** = piliers notés par l'enseignant (2/3) et par les observateurs (1/3).

## Déroulement d'une leçon

1. Appel (+ 😓 petite forme : −10 % de VMA aux fractionnés), équipes / séries / parcours dans Programmation du cycle.
2. **📲 QR de la leçon** : les tablettes reçoivent élèves, exercices, équipes, parcours, VMA.
3. Sur chaque tablette : Saisie → l'exercice → saisie en groupe (tuiles, chronos, carte…). 🚩 Abandon partout.
4. **📤 Envoyer mes saisies** → **📥 Récupérer** sur la tablette enseignant (fusion exercice par exercice).
5. Bilans : 🏃 Bilan des exercices (distance de chaque élève, équipes, binômes), 📝 Évaluation, 🎓 Piliers (enseignant).

Mise en ligne : La Forge (`.gitlab-ci.yml`) ou GitHub Pages. **Toute mise à jour = `version` (activite.js) et `CACHE` (sw.js) augmentés.**

## Nouveautés 2.5

- **Groupes par exercice** (tests, fractionnés, évaluation, course chronométrée) : nombre de groupes et composition dans la Programmation ; l'onglet « Groupes » de la classe est retiré.
- **Élèves concernés** par un exercice : toute la classe ou une sélection (ex. rattrapage du test VMA en L2 pour les absents de L1). Les autres ne le voient pas et il ne compte pas pour eux.
- **Course chronométrée** : distance au choix, temps en minutes et secondes (🏁 ou saisie ✎), vitesse et % de VMA.
- VMA fixée : la virgule (12,5) est acceptée.

## Nouveautés 2.6

Nouvelles situations à ajouter dans la Programmation des leçons (le cycle par défaut ne change pas) :

- **🚂 Run Express** : nouveau nom des « Aventuriers du … » (mêmes plateaux, mêmes règles ; les saisies déjà faites restent valables).
- **🏁 All finishers** (Course chronométrée → Départ) : temps visé de chaque coureur à X % de sa VMA (−10 % en petite forme) ; le plus lent part au top, les autres avec le retard nécessaire pour que tout le monde arrive ensemble. Ordre des départs affiché et annoncé, prénom appelé 10 s avant et au départ (sifflet), temps compté depuis le départ de chacun, écart au temps visé (vert ±3 %, orange ±6 %), ordre d'arrivée et écart premier–dernier.
- **🧟 Zombie Frac'** : un fractionné (mêmes formes, cibles, groupes Série 1 · Rouge / Série 1 · Bleu, piliers) raconté comme une fuite : 3 missions, messages radio à voix haute, 🏃 échappé / 🩹 griffé / 🧟 rattrapé, infection et antidote, zombie chasseur (+10 %), camp qui se construit avec les ressources de la classe. Compte comme un fractionné (cibles, fil rouge).
- **🏎️ Kart'Endurance** : écuries (🧩), rôles tournants à chaque Grand Prix, circuit = forme des manches, bip régulier, boîte à objets (cartes Bonus / Malus / Kart, 3 en main), pièces par élève, fair-play, classements, tableau de bord des pilotes (FC, Borg, ce que je change), cartes inventées par les élèves, cartes à imprimer.
- **🐺 Gare aux loups** : 6 leçons types, nuits à allure imposée avec signal (sifflet, hurlement ou gong), tirage des rôles et « passe la tablette », défis et missions secrètes, statuts (mordu, guéri, révélé), grille du gardien du temps (contrat tenu = droit de vote), plots par signal, indices, vote à main levée ou secret avec révélation, cartes à imprimer.
- Voix de la tablette : bouton 🔊 / 🔇 dans les jeux (réglage propre à chaque tablette).
- Pioche, mains, votes et journal restent sur la tablette qui anime ; les pièces, rôles, statuts et plots relevés de chaque élève remontent avec 📤 / 📥.

## Nouveautés 2.7 (socle N'EPS 1.5)

- **Menu enseignant en trois entrées** : 🛠 Préparer le cycle (classe, groupes, paramètres, 🗺️ programmation des leçons, ⚡ VMA) · 📅 **Mes leçons** (une tuile par leçon : à préparer, en cours avec le nombre de fiches reçues, terminée) · 📊 Suivi et bilans (bilan des exercices, évaluation, piliers, résultats, classement, fils rouges, export).
- **🧰 Ma leçon** : les outils dans l'ordre du déroulement, avec un bouton « Suivant » : ✏️ Réglages → 🏃 **Programme de la leçon** (les exercices de la leçon et leurs réglages) → ✅ Appel → 🎭 Rôles → 📲 QR → ✍️ Saisie → ⏱ Outils → 📥 Récupérer → 🏁 Bilan de la leçon (avec « 🏃 Bilan des exercices » et « ▶ Préparer la leçon suivante »). Sélecteur de leçon 1…8 en haut, sans quitter l'outil ouvert.
- « 🏁 Marquer la leçon terminée » : simple repère (✅ dans Mes leçons), rien n'est figé.
- Le reste du socle 1.5 : envoi des fiches d'une leçon précédente pas encore envoyées, outil 🪞 miroir différé disponible (non activé).
