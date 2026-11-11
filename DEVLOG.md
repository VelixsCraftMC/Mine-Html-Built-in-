# Devlog

## 1.3.0 (2026-11-11)
- Block berbasis JSON: assets/block/**/*.json = { identifier, components }; satu komponen = satu berkas JS di src/features/block/components (displayname, category, geometry, textures, loot, transforplacetop, collision, selection, lightdampening)
- Komponen baru cukup berkas baru + satu baris di components/index.js; komponen rusak/tidak dikenal dilewati, blok tetap jadi
- Assets dipecah: models/{block,entity,item}, textures/{block,colormap}, particles, biome, fog, minimap, sounds. Model pemain pindah ke assets/models/entity/player/
- Tekstur satu blok banyak sisi di satu folder; path yang sama = satu slot atlas (tanpa duplikat). Rumput: overlay samping diwarnai biome
- Dunia dari dimension/overworld.flat.json (di luar core): chunk Uint16, generator terdaftar, streaming + pembuangan chunk jauh, mesher face-culling, kabut dari biome/fog
- Warna rumput dari colormap (suhu/curah hujan biome); fisika pemain memakai world.groundAt
- transforplacetop: blok yang ditutup berubah setelah N detik (waktu nyata)
- mods/ sementara: mods/mods.json memilih mod aktif, mods/<id>/manifest.json; mod rusak dilewati
- tools/index.mjs (indeks block otomatis), tools/selftest.mjs (uji logika), tools/lint.mjs (batas baris, JSON, tekstur ganda, manifest)
- Bundle satu file kini menanam assets/, dimension/, mods/ (sounds/ tidak ditanam)

## 1.2.0 (2026-11-11)
- Awan 3D ala Minecraft Java: sel 12x12 blok, tebal 4 blok, alpha 0,8, shade muka atas 1.0 / timur-barat 0.9 / utara-selatan 0.8 / bawah 0.7
- Awan bisa dilihat dari atas dan dari dalam lapisan awan; ray-march grid di shader, tanpa geometri
- CloudConfig: height, thickness, cell, wind, alpha, fade dalam satu objek
- Build satu file minehtml.js (aset tertanam, tanpa CSS/berkas lain): node tools/build.mjs
- Assets: pintu tunggal aset (dev = path, bundle = data URI)
- Opsi bisa ditimpa lewat window.MineHTMLOptions sebelum minehtml.js dimuat
