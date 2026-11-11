# mods/ (sementara)

Mod native = folder `mods/<id>/` berisi `manifest.json` + berkas JSON/PNG dengan format yang sama seperti `assets/`.

```
mods/<id>/manifest.json        { "id", "name", "version", "blocks": ["blocks/x.json"] }
mods/<id>/blocks/x.json        identifier "<id>:x", komponen block biasa
mods/<id>/textures/...         dirujuk dengan "block/x" (milik sendiri) atau "minecraft:block/dirt/dirt" (bawaan)
mods/<id>/models/block/...     geometri khusus: "geometry": "nama"
```

Aktifkan dengan menambah id ke `mods/mods.json` → `{ "enabled": ["<id>"] }`.
Mod yang rusak dilewati (peringatan di console), game tetap jalan.
