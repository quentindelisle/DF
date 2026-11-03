# Demi-fond VMA — N'EPS numérique

CA1 · Demi-fond · performance auto-référencée · Quentin Delisle · socle N'EPS 1.3.0 · v1.0.0

## Le cycle (8 leçons, modifiable dans 🗺️ Plan des courses)

| Leçon | Forme | Courses par défaut |
|---|---|---|
| L1 | ⏱️ Test demi-Cooper | 6 min → VMA = distance ÷ 100 |
| L2 | 🏃 Courses à allure | 500 m à 80, 85 et 90 % de VMA |
| L3 | 🔥 Bats tes perfs | 300 m à 95 %, 500 m à 90 %, 800 m à 85 %, en battant le temps visé |
| L4 | 🏃 Courses à allure | 4 × 500 m à 90 % |
| L5 | 🏃 Courses à allure | 2 × 800 m à 85 %, 400 m à 95 % |
| L6 | ⏱️ Retest demi-Cooper | nouvelle VMA |
| L7 | 🏃 Courses à allure | 3 × 500 m à 90 % (VMA de L6) |
| L8 | 📝 Évaluation | 3 × 500 m à 90 %, 10 min de récup |

Pour chaque leçon, l'enseignant choisit la forme et chaque course : distance, % de VMA, récupération.
Le temps visé de chaque élève = distance ÷ (VMA × %). Les temps de passage à chaque tour de piste sont affichés pour le chronométreur.
La VMA de référence est celle du dernier demi-Cooper avant la leçon ; l'enseignant peut fixer une VMA (⚡ VMA des élèves).

## Déroulement d'une leçon

1. Appel, puis **📲 QR de la leçon** : les tablettes reçoivent les élèves, les rôles, le plan des courses et les VMA.
2. Trinômes : **coureur** (sans montre), **chronométreur** (départ, passages annoncés, temps saisi), **observateur** (critères d'allure et de posture, méthode).
3. Demi-Cooper : outil 🏃 Compteur de tours (report automatique), puis mètres du dernier tour.
4. **📤 Envoyer mes saisies** sur chaque tablette, **📥 Récupérer** sur la tablette enseignant.
5. Bilans : ⏱️ Courses et temps visés, ⚡ VMA, fils rouge / bleu, notes.

## Note sur 20

- Écart annoncé / réalisé (L8, moyenne des 3 courses, en % du temps annoncé) : ≤ 1 % = 10 pts, ≥ 10 % = 0, linéaire entre les deux.
- Progrès de VMA (dernier demi-Cooper − premier) : 0 = 0 pt, + 1,5 km/h et plus = 6 pts.
- Fil rouge investissement /2 et fil bleu méthodo /2 (niveau final décidé par l'enseignant).

Course réussie (leçons à allure) : temps à ± 3 % du temps visé (réglable). Bats tes perfs : temps ≤ temps visé.

## Fichiers

`activite.js` (configuration) · `specifique.js` (plan des courses, VMA, temps visés, écarts) · le reste est le socle N'EPS, inchangé.
Mise en ligne : La Forge (`.gitlab-ci.yml`) ou GitHub Pages. **Toute mise à jour = `version` dans activite.js et `CACHE` dans sw.js augmentés.**
Sauvegarder la tablette enseignant (.neps) en fin de cycle : aucune donnée ne quitte les tablettes.
