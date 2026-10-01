-- Per-SKU stills for craft beer and glassware (replace shared beer.png / glassware.png).
-- Rollback: set image_path back to /images/city-wine/beer.png or glassware.png by kind.

update citywine.catalog_products
set image_path = '/images/city-wine/beer-cauce-ambar.png'
where id = 'beer-cauce-ambar';

update citywine.catalog_products
set image_path = '/images/city-wine/beer-lagrimas-negras.png'
where id = 'beer-lagrimas-negras';

update citywine.catalog_products
set image_path = '/images/city-wine/beer-bruma.png'
where id = 'beer-bruma';

update citywine.catalog_products
set image_path = '/images/city-wine/glass-copa-sommelier.png'
where id = 'glass-copa-sommelier';

update citywine.catalog_products
set image_path = '/images/city-wine/glass-decantador-noche.png'
where id = 'glass-decantador-noche';

update citywine.catalog_products
set image_path = '/images/city-wine/glass-vaso-facetado.png'
where id = 'glass-vaso-facetado';
