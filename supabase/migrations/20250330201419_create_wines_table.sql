CREATE TABLE IF NOT EXISTS wines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,
    vintage INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    rating INTEGER CHECK (rating >= 0 AND rating <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserisci i dati di esempio
INSERT INTO wines (name, region, vintage, type, price, rating) VALUES
    ('Barolo DOCG', 'Piemonte', 2018, 'Rosso', 45.00, 95),
    ('Chianti Classico', 'Toscana', 2019, 'Rosso', 35.00, 92),
    ('Amarone della Valpolicella', 'Veneto', 2017, 'Rosso', 65.00, 96),
    ('Brunello di Montalcino', 'Toscana', 2016, 'Rosso', 85.00, 98),
    ('Prosecco DOC', 'Veneto', 2021, 'Spumante', 25.00, 88),
    ('Vermentino di Sardegna', 'Sardegna', 2022, 'Bianco', 20.00, 87),
    ('Nero d''Avola', 'Sicilia', 2020, 'Rosso', 28.00, 90),
    ('Montepulciano d''Abruzzo', 'Abruzzo', 2021, 'Rosso', 22.00, 86),
    ('Gavi DOCG', 'Piemonte', 2022, 'Bianco', 30.00, 89),
    ('Lambrusco di Sorbara', 'Emilia-Romagna', 2022, 'Rosato', 18.00, 85)
ON CONFLICT DO NOTHING;
