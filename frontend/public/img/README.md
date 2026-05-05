# Coloca aquí las imágenes del catálogo

Archivos esperados (referenciados en `src/lib/data/products.ts` y componentes):

```
banner.jpg
lomo-fino.jpg          tomahawk.jpg          carne-molida.jpg
chuleta-cerdo.jpg      costillas-bbq.jpg
pechuga-pollo.jpg      alitas-picantes.jpg
chorizos.jpg           t-bone.jpg            paquete-familiar.jpg

blog-cocinar-carne.jpg blog-cortes.jpg       blog-marinar.jpg
blog-asado.jpg         blog-higiene.jpg      blog-receta-hamburguesa.jpg

placeholder.jpg        # ← fallback automático cuando una imagen no carga
```

Si una imagen no existe, los componentes hacen `onError → /img/placeholder.jpg`,
así que basta con tener al menos `placeholder.jpg` para evitar iconos rotos.
