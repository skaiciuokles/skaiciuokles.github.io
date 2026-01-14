# Lietuvos Mokesčių Skaičiuoklė (2026)

Moderni, greita ir išsami mokesčių skaičiuoklė Lietuvai, sukurta naudojant „React 19“ ir „Bun“. Ši programa padeda apskaičiuoti mokesčius įvairioms pajamų rūšims, įskaitant darbo santykius, individualią veiklą pagal pažymą ir mažąsias bendrijas (MB).

## 🚀 Funkcijos

- **Išsamus mokesčių skaičiavimas**: Palaiko GPM, Sodros (VSD, PSD) įmokų skaičiavimą įvairioms pajamų rūšims.
- **Aktualu 2026 metams**: Įtraukti naujausi mokesčių tarifai, MMA (minimali mėnesinė alga) ir VDU (vidutinis darbo užmokestis) 2026 metams. Taip pat įtrauktas naujas progersyvus GPM sskaičiavimas sumuojant papildomas pajamas
- **Kelios pajamų rūšys**:
  - **Darbo santykiai**: Atlyginimo „į rankas“, „ant popieriaus“ ir bendros darbo vietos kainos skaičiavimas.
  - **Individuali veikla (IV)**: Automatinis 30% išlaidų atskaitymas ir progresyvaus mokesčių kredito (GPM) skaičiavimas.
  - **Mažoji bendrija (MB)**: Mokesčių skaičiavimas MB vadovui.
- **Prisitaikantis dizainas (Responsive)**: Optimizuota tiek kompiuteriams, tiek mobiliesiems įrenginiams naudojant „Tailwind CSS“ ir „Radix UI“.
- **Duomenų išsaugojimas**: Įvesti duomenys automatiškai išsaugomi naršyklės atmintyje (`localStorage`).
- **Išsamios suvestinės**: Kiekvieno mokesčio dedamosios dalys su paaiškinimais ir nuorodomis.
- **SEO optimizacija**: Specialus build scenarijus generuoja statinius puslapius su reikiamomis meta žymomis, sitemap ir robots.txt.

## 🛠️ Technologijos

- **Vykdymo aplinka**: [Bun](https://bun.sh)
- **Karkasas**: [React 19](https://react.dev)
- **Maršrutizavimas**: [TanStack Router](https://tanstack.com/router)
- **Stiliai**: [Tailwind CSS 4](https://tailwindcss.com)
- **Komponentai**: [shadcn/ui](https://ui.shadcn.com) (Radix UI)
- **Ikonos**: [Lucide React](https://lucide.dev), [Simple Icons](https://simpleicons.org)
- **Analitika**: [PostHog](https://posthog.com)
- **Įrankiai**: ESLint, Prettier, TypeScript

## 📥 Pradžia

### Reikalavimai

Jums reikia turėti įdiegtą [Bun](https://bun.sh).

### Diegimas

```bash
bun install
```

### Kūrimas (Development)

Paleiskite kūrimo serverį su automatiniu perkrovimu (hot reload):

```bash
bun dev
```

Programėlė bus pasiekiama adresu `http://localhost:5000`.

### Produkcinė versija (Build)

Produkcinė versija generuojama naudojant specialų `build.ts` scenarijų, kuris optimizuoja resursus ir sukuria statinius SEO optimizuotus puslapius.

```bash
# Sugeneruoti maršrutus ir sukurti produkcinę versiją
bun run build

# Peržiūrėti sugeneruotą versiją
bun start
```

## 🏗️ Projekto struktūra

- `src/components/ui/`: Daugkartinio naudojimo UI komponentai (shadcn/ui).
- `src/routes/`: Programos maršrutizavimas naudojant „TanStack Router“.
- `src/lib/`: Pagalbinės funkcijos ir aplinkos konfigūracija.
- `build.ts`: Build scenarijus optimizacijai ir SEO.

## ⚙️ Aplinkos kintamieji

Programėlė naudoja šiuos aplinkos kintamuosius (su `BUN_PUBLIC_` prefiksu prieigai iš kliento pusės):

- `BUN_PUBLIC_POSTHOG_KEY`: PostHog projekto API raktas.
- `BUN_PUBLIC_POSTHOG_HOST`: PostHog serverio adresas (pvz., `https://eu.i.posthog.com`).
- `BUN_PUBLIC_BUILD_NUMBER`: Pasirinktinis build numeris, rodomas vartotojo sąsajoje.

## ⚠️ Atsakomybės apribojimas

Ši skaičiuoklė yra informacinio pobūdžio. Rezultatai yra apytiksliai ir gali skirtis nuo galutinių VMI (Valstybinės mokesčių inspekcijos) ar „Sodros“ apskaičiavimų. Rekomenduojama visada pasitikrinti oficialią informaciją VMI ir „Sodros“ tinklalapiuose.
