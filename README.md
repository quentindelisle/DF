# Demi-fond N'EPS

CA1 · Demi-fond · performance auto-référencée · Quentin Delisle · socle N'EPS 1.3.0 · **v2.0.0**

## Fichiers

| Fichier | Rôle |
|---|---|
| `activite.js` | configuration (synthèse par leçon : VMA, distance, cibles, piliers, abandons, méthode) |
| `df-core.js` | piste, programmation multi-exercices, VMA de référence, piliers, comptes à rebours, fusion des saisies |
| `df-exos.js` | écrans : demi-Cooper / Bats tes perfs, course d'équipe, pelotons, fractionnés, évaluation 3 × 500 m |
| `df-aventuriers.js`, `df-plateau.js`, `aventuriers/plateau.jpg` | Les Aventuriers du 44 |
| `df-prof.js` | espace enseignant : programmation, VMA, piliers enseignant, bilan, évaluation par blocs |
| `df-fiches.js` | fiches 📖 des exercices, classe de démonstration, styles |
| le reste | socle N'EPS (inchangé) |

`specifique.js` (v1) n'est plus utilisé : il peut être supprimé du dépôt.

## Piste

Espace enseignant → 🗺️ Programmation du cycle → **Ma piste** : piste circulaire (1 tour = longueur) ou couloir en aller-retour (1 tour = 2 × longueur).
Tour impossible en dessous de 26 km/h. Demi-Cooper : un plot tous les ≈ 50 m (= +0,5 km/h).

## Cycle par défaut (1 à 4 exercices par leçon, modifiable)

| Leçon | Exercices |
|---|---|
| L1 | ⏱️ Test demi-Cooper + 🤝 Course d'équipe |
| L2 | ⚡ Fractionné court 30/30 + 🗺️ Aventuriers du 44 |
| L3 | 🔥 Bats tes perfs + 🐇 Course en pelotons |
| L4 | 🔁 Fractionné long 4 × 3 min + 🗺️ Aventuriers du 44 |
| L5 | ⚡ Pyramide 15-30-45-30-15 s + 🤝 Course d'équipe |
| L6 | 🔁 Fractionné long 3 × 1000 m + 🐇 Course en pelotons |
| L7 | ⚡ 8 × 200 m + 🐇 Course en pelotons |
| L8 | 📝 Évaluation 3 × 500 m |

## Barèmes

- **Bats tes perfs /6** (progrès de VMA) : moins bien → 1 (plus de 1 km/h perdu) ou 2 · même VMA (−0,25 à +0,4) → 3 · +0,5 à 1,4 → 4 · +1,5 à 2,4 → 5 · +2,5 et plus → 6.
- **Pelotons /10 par course** : % de VMA (135 % et plus = 5, −0,5 par tranche de 5 %) + points du joker validé ; au-delà de 10, report sur la course suivante.
- **Aventuriers** : trajets 1 → 1 pt, 2 → 2, 3 → 4, 4 → 7, 5 → 10 ; parcours relié = sa valeur (plus court chemin en tronçons) ; +10 plus de villes, +10 plus de parcours (égalité : le premier) ; trinômes × coefficient s'il y a aussi des binômes.
- **Évaluation (blocs séparés)** : AFL1 3 × 500 m /12 (3 pts par course selon le % de VMA : 110 % = 3 · 105 = 2,5 · 100 = 2 · 95 = 1,5 · 90 = 1 · 85 = 0,5 ; régularité /3 : −0,5 par tranche de 4 s d'écart entre deux courses) · Bats tes perfs /6 · régularité de l'investissement /2 · qualité de l'investissement /3 · qualité des observations /3 · quantité des observations /2 · piliers élèves /3 · piliers enseignant /6.

## Déroulement d'une leçon

1. Appel (+ 😓 petite forme : −10 % de VMA aux fractionnés), équipes / séries / parcours dans Programmation du cycle.
2. **📲 QR de la leçon** : les tablettes reçoivent élèves, exercices, équipes, parcours, VMA.
3. Sur chaque tablette : Saisie → l'exercice → saisie en groupe (tuiles, chronos, carte…). 🚩 Abandon partout.
4. **📤 Envoyer mes saisies** → **📥 Récupérer** sur la tablette enseignant (fusion exercice par exercice).
5. Bilans : 🏃 Bilan des exercices (distance de chaque élève, équipes, binômes), 📝 Évaluation, 🎓 Piliers (enseignant).

Mise en ligne : La Forge (`.gitlab-ci.yml`) ou GitHub Pages. **Toute mise à jour = `version` (activite.js) et `CACHE` (sw.js) augmentés.**
