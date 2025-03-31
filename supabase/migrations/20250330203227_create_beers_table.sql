CREATE TABLE IF NOT EXISTS beers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brewery VARCHAR(255) NOT NULL,
    style VARCHAR(100) NOT NULL,
    abv DECIMAL(4,1) NOT NULL,
    ibu INTEGER CHECK (ibu >= 0 AND ibu <= 100),
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserisci i dati di esempio
INSERT INTO beers (name, brewery, style, abv, ibu, rating, price) VALUES
    ('Peroni Nastro Azzurro', 'Birra Peroni', 'Lager', 5.1, 20, 3.5, 2.50),
    ('Moretti La Rossa', 'Birra Moretti', 'Doppio Malto', 7.2, 35, 4.2, 3.80),
    ('Ichnusa Non Filtrata', 'Ichnusa', 'Lager', 5.0, 25, 4.0, 3.20),
    ('Menabrea Ambrata', 'Birra Menabrea', 'Amber', 5.0, 28, 4.1, 3.50),
    ('Baladin Isaac', 'Baladin', 'Wheat Beer', 5.0, 15, 4.3, 4.20),
    ('Birra del Borgo ReAle', 'Birra del Borgo', 'Pale Ale', 6.4, 40, 4.4, 4.50),
    ('Toccalmatto Zona Cesarini', 'Toccalmatto', 'IPA', 6.5, 65, 4.5, 5.00),
    ('Loverbeer BeerBera', 'Loverbeer', 'Sour', 6.0, 10, 4.6, 6.50),
    ('Birrificio Angelo Poretti 3 Luppoli', 'Angelo Poretti', 'Pilsner', 4.8, 22, 3.8, 3.30),
    ('Birra Forst Sixtus', 'Forst', 'Bock', 6.5, 30, 4.0, 4.80)
ON CONFLICT DO NOTHING;
