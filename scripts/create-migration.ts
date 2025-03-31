import * as fs from 'fs'
import * as path from 'path'
import { format } from 'date-fns'

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')
const TABLES_DIR = path.join(MIGRATIONS_DIR, 'tables')
const TEMPLATE_PATH = path.join(TABLES_DIR, 'template.sql')

function createMigration(tableName: string, description: string) {
    // Crea il nome del file con timestamp
    const timestamp = format(new Date(), 'yyyyMMddHHmmss')
    const fileName = `${timestamp}_create_${tableName}_table.sql`
    const filePath = path.join(MIGRATIONS_DIR, fileName)

    // Leggi il template
    let template = fs.readFileSync(TEMPLATE_PATH, 'utf8')

    // Sostituisci i placeholder
    template = template
        .replace(/\[nome_tabella\]/g, tableName)
        .replace(/\[descrizione della tabella\]/g, description)
        .replace(/\[data\]/g, format(new Date(), 'dd/MM/yyyy'))

    // Scrivi il nuovo file
    fs.writeFileSync(filePath, template)

    console.log(`✅ Migrazione creata: ${fileName}`)
    console.log(`📝 Modifica il file in: ${filePath}`)
}

// Verifica che il nome della tabella sia stato fornito
const tableName = process.argv[2]
const description = process.argv[3] || ''

if (!tableName) {
    console.error('❌ Errore: Specifica il nome della tabella')
    console.log('Uso: npm run create-migration <nome_tabella> [descrizione]')
    process.exit(1)
}

createMigration(tableName, description) 