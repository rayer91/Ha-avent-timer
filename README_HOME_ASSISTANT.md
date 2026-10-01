# Philips Avent Cumisüveg Időzítő & Kalkulátor - Home Assistant Add-on Útmutató

Ez az alkalmazás teljes mértékben fel van készítve arra, hogy **Home Assistant Add-onként (Bővítményként)** fusson közvetlenül a Home Assistant rendszereden (Raspberry Pi, Intel NUC, Home Assistant Green/Yellow, x86_64, ODROID stb.).

A beépített **Home Assistant Ingress** támogatásnak köszönhetően a bal oldali menüsávban közvetlenül megjelenik egy cumisüveg ikonnal, nem igényel külön portnyitást vagy SSL konfigurációt!

---

## 🚀 Telepítés 1. Módszer: Saját GitHub Repositoryként (Ajánlott)

Ha feltöltöd ezt a projektet a saját GitHub fiókodba, a Home Assistant automatikusan felismeri mint hivatalos bővítmény-adattárat (a gyökérben lévő `repository.yaml` és `config.yaml` miatt):

1. **GitHubra feltöltés:**
   * Hozz létre egy új publikus GitHub repository-t (pl. `avent-bottle-warmer`).
   * Töltsd fel (`git push`) a projekt összes fájlját.
   * Az URL pl.: `https://github.com/felhasznalonev/avent-bottle-warmer`

2. **Hozzáadás a Home Assistanthoz:**
   * Lépj be a Home Assistant felületére.
   * Menj a **Beállítások (Settings) ➔ Bővítmények (Add-ons) ➔ Kiegészítő-áruház (Add-on Store)** menüpontba.
   * A jobb felső sarokban kattints a **három pontra (⋮)**, majd válaszd az **Adattárak (Repositories)** lehetőséget.
   * Illeszd be a GitHub repositoryd linkjét, majd kattints a **Hozzáadás** gombra.

3. **Telepítés és indítás:**
   * Zárd be az ablakot, frissítsd az áruházat.
   * A lista tetején megjelenik a **„Philips Avent Cumisüveg Időzítő”**.
   * Kattints a **Telepítés (Install)** gombra (a Home Assistant automatikusan felépíti a Docker konténert a te hardveredhez).
   * Kapcsold be a **Megjelenítés az oldalsávon (Show in sidebar)** és az **Automatikus indítás (Start on boot)** opciókat.
   * Kattints az **Indítás (Start)**, majd a **Felület megnyitása (Open Web UI)** gombra!

---

## 🛠️ Telepítés 2. Módszer: Helyi Add-onként (GitHub nélkül)

Ha nem szeretnéd GitHubra tölteni, közvetlenül a gépedről is bemásolhatod a Home Assistantba:

1. Nyisd meg a Home Assistant tárhelyét (pl. **Samba share** bővítménnyel vagy **SSH**-val).
2. Keresd meg a `/addons` mappát.
3. Hozz létre egy új mappát: `/addons/avent-warmer/`.
4. Másold bele a projekt összes fájlját.
5. Menj a **Beállítások ➔ Bővítmények ➔ Kiegészítő-áruház** felületre, a jobb felső 3 pontra kattintva válaszd az **Oldal újratöltése** opciót.
6. A helyi bővítményeknél (Local add-ons) kattints a telepítésre!

---

## 🔌 TP-Link Tapo Okoskonnektor (P100 / P110 / P115) Összekötése

A TP-Link Tapo konnektorok az egyik legnépszerűbb és legmegbízhatóbb okoskonnektorok Home Assistant alatt.

### Hogyan működik a gyakorlatban?
1. Dugd be a Philips Avent melegítőt a Tapo konnektorba.
2. Az alkalmazás fejlécében kattints a **Tapo / HA** gombra:
   * **Add-onként futtatva:** A bővítmény a `homeassistant_api: true` engedély miatt **automatikusan felismeri a Home Assistantot**, és egy lenyíló listában felkínálja az összes elérhető okoskonnektorodat! Csak kiválasztod a Tapo konnektort, és kész – **nem kell semmilyen Webhookot vagy tokent konfigurálnod!**
   * **Külső böngészőből használva:** Megadhatod a Home Assistant webhook címedet is.
3. Amikor elindítod a melegítést, a Tapo konnektor bekapcsol; amikor lejár a visszaszámláló, **azonnal áramtalanítja a melegítőt**, így a forró víz garantáltan nem forralja túl a tejet!

