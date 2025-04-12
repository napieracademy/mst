import { Container } from "@/components/container";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const metadata = {
  title: "Privacy Policy | MST",
  description: "Politica sulla privacy e protezione dei dati personali",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen w-full bg-black text-white">
      <Header />
      <Container className="pt-24 pb-12 relative z-20" maxWidth="standardized">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">Data dell'ultimo aggiornamento: 12 aprile 2025</p>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">1. Introduzione</h2>
            <p>
              Benvenuti alla Privacy Policy di MST. Questa pagina informa gli utenti sulle nostre politiche riguardanti 
              la raccolta, l'uso e la divulgazione dei dati personali quando si utilizza il nostro servizio e le scelte 
              associate a tali dati.
            </p>
            <p>
              Utilizziamo i vostri dati personali per fornire e migliorare il nostro servizio. Utilizzando il servizio, 
              accettate la raccolta e l'utilizzo delle informazioni in conformità con questa politica.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">2. Titolare del Trattamento</h2>
            <p>
              Ai sensi del Regolamento Generale sulla Protezione dei Dati (GDPR), il titolare del trattamento dei vostri 
              dati personali è:
            </p>
            <p>
              <strong>Claudio Ripoli</strong><br />
              Via Paolo Savi 12 A<br />
              51015 Montecatini Terme (PT)<br />
              Italia<br />
              Email: claudio.ripoli@gmail.com
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">3. Tipologie di Dati Raccolti</h2>
            <p>Durante l'utilizzo del nostro servizio, potremmo raccogliere diversi tipi di informazioni personali, tra cui:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Dati di utilizzo</strong>: Raccogliamo automaticamente informazioni su come si accede e si utilizza il nostro servizio.</li>
              <li><strong>Dati del dispositivo</strong>: Possiamo raccogliere informazioni sul vostro dispositivo, inclusi indirizzo IP, tipo di browser, sistema operativo, identificatori unici del dispositivo.</li>
              <li><strong>Dati di navigazione</strong>: Utilizziamo cookie e tecnologie simili per raccogliere informazioni sulla vostra attività di navigazione.</li>
              <li><strong>Dati personali</strong>: In alcune sezioni del sito, potremmo chiedervi dati personali come nome, indirizzo email, numero di telefono.</li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">4. Metodi di Raccolta</h2>
            <p>I vostri dati personali possono essere raccolti nei seguenti modi:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Interazione diretta</strong>: Quando compilate moduli o interagite con il nostro sito web.</li>
              <li><strong>Tecnologie automatizzate</strong>: Quando navigate sul nostro sito, raccogliamo automaticamente dati tecnici sul vostro dispositivo, azioni e modelli di navigazione tramite cookie, pixel e altre tecnologie di tracciamento.</li>
              <li><strong>Terze parti</strong>: Potremmo ricevere informazioni su di voi da terze parti come partner commerciali, fornitori di servizi tecnici, di pagamento e di consegna, reti pubblicitarie, fornitori di analisi, fornitori di informazioni di ricerca.</li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">5. Tracciamenti e Cookie</h2>
            <p>
              Utilizziamo cookie e tecnologie di tracciamento simili per monitorare l'attività sul nostro sito e 
              memorizzare determinate informazioni. I tracciamenti utilizzati includono:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Pixel di Meta (Facebook)</strong>: Utilizziamo il pixel di Meta per misurare l'efficacia 
                delle nostre campagne pubblicitarie, comprendere le azioni degli utenti sul nostro sito e per 
                mostrarvi annunci personalizzati su Facebook, Instagram e altre piattaforme di Meta.
              </li>
              <li>
                <strong>Google Analytics</strong>: Utilizziamo Google Analytics per analizzare l'utilizzo del 
                nostro sito web, monitorare il rendimento delle nostre campagne di marketing e migliorare la 
                vostra esperienza utente.
              </li>
              <li>
                <strong>Google Ads</strong>: Utilizziamo il tracciamento di Google Ads per misurare le conversioni 
                e ottimizzare le nostre campagne pubblicitarie su Google.
              </li>
              <li>
                <strong>Cookie tecnici</strong>: Sono essenziali per il funzionamento del sito e per fornirvi 
                i servizi disponibili attraverso il sito.
              </li>
              <li>
                <strong>Cookie di preferenza</strong>: Ci permettono di ricordare le vostre preferenze e impostazioni.
              </li>
              <li>
                <strong>Cookie di terze parti</strong>: Forniti da servizi di terze parti che appaiono sulle nostre pagine.
              </li>
            </ul>
            <p className="mt-4">
              Potete gestire le vostre preferenze sui cookie attraverso le impostazioni del vostro browser o 
              utilizzando il nostro strumento di gestione dei cookie disponibile sul sito.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">6. Utilizzo dei Dati</h2>
            <p>Utilizziamo i dati raccolti per vari scopi, tra cui:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Fornire e mantenere il nostro servizio</li>
              <li>Notificarvi cambiamenti al nostro servizio</li>
              <li>Permettervi di partecipare a funzionalità interattive del nostro servizio quando lo desiderate</li>
              <li>Fornire assistenza clienti</li>
              <li>Raccogliere analisi o informazioni preziose per migliorare il nostro servizio</li>
              <li>Monitorare l'utilizzo del nostro servizio</li>
              <li>Rilevare, prevenire e affrontare problemi tecnici</li>
              <li>Fornirvi notizie, offerte speciali e informazioni generali su altri beni, servizi ed eventi che offriamo simili a quelli che avete già acquistato o richiesto, a meno che non abbiate scelto di non ricevere tali informazioni</li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">7. Base Giuridica del Trattamento</h2>
            <p>
              Trattiamo i vostri dati personali solo quando abbiamo una base giuridica per farlo. Le basi giuridiche 
              su cui ci basiamo includono:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Consenso</strong>: Avete dato il vostro consenso esplicito al trattamento dei vostri dati personali.</li>
              <li><strong>Esecuzione di un contratto</strong>: Il trattamento è necessario per l'esecuzione di un contratto con voi o per prendere provvedimenti su vostra richiesta prima di stipulare un contratto.</li>
              <li><strong>Obblighi legali</strong>: Il trattamento è necessario per adempiere a un obbligo legale a cui siamo soggetti.</li>
              <li><strong>Interessi legittimi</strong>: Il trattamento è necessario per i nostri interessi legittimi o quelli di terzi, a condizione che i vostri interessi e diritti fondamentali non prevalgano su tali interessi.</li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">8. Condivisione dei Dati</h2>
            <p>Potremmo divulgare i vostri dati personali nelle seguenti situazioni:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Con fornitori di servizi</strong>: Per monitorare e analizzare l'utilizzo del nostro servizio e per comunicare con voi.</li>
              <li><strong>Per trasferimenti commerciali</strong>: In connessione con, o durante le negoziazioni di, qualsiasi fusione, vendita di beni aziendali, finanziamento o acquisizione.</li>
              <li><strong>Con affiliati</strong>: Potremmo condividere le vostre informazioni con i nostri affiliati, nel qual caso richiederemo a tali affiliati di rispettare questa Privacy Policy.</li>
              <li><strong>Con partner commerciali</strong>: Per offrirvi determinati prodotti, servizi o promozioni.</li>
              <li><strong>Con altri utenti</strong>: Quando condividete informazioni personali o interagite in aree pubbliche.</li>
              <li><strong>Per conformità legale</strong>: Se siamo tenuti a divulgare i vostri dati personali per conformarci a un obbligo di legge.</li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">9. Trasferimento dei Dati</h2>
            <p>
              Le vostre informazioni, compresi i dati personali, possono essere trasferite a — e mantenute su — computer 
              situati al di fuori del vostro stato, provincia, paese o altra giurisdizione governativa dove le leggi 
              sulla protezione dei dati possono differire da quelle della vostra giurisdizione.
            </p>
            <p className="mt-2">
              Se vi trovate al di fuori dell'Italia e scegliete di fornirci informazioni, tenete presente che trasferiamo 
              i dati, compresi i dati personali, in Italia e li elaboriamo lì.
            </p>
            <p className="mt-2">
              Il vostro consenso a questa Privacy Policy seguito dalla vostra presentazione di tali informazioni 
              rappresenta il vostro accordo a tale trasferimento.
            </p>
            <p className="mt-2">
              Adotteremo tutte le misure ragionevolmente necessarie per garantire che i vostri dati siano trattati in modo 
              sicuro e in conformità con questa Privacy Policy e nessun trasferimento dei vostri dati personali avrà luogo 
              a un'organizzazione o a un paese a meno che non vi siano controlli adeguati, inclusa la sicurezza dei vostri 
              dati e di altre informazioni personali.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">10. I Vostri Diritti sulla Protezione dei Dati</h2>
            <p>
              In base al Regolamento Generale sulla Protezione dei Dati (GDPR), avete i seguenti diritti in relazione 
              ai vostri dati personali:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Diritto di accesso</strong>: Avete il diritto di richiedere copie dei vostri dati personali.</li>
              <li><strong>Diritto di rettifica</strong>: Avete il diritto di richiedere che correggiamo qualsiasi informazione che ritenete sia inesatta o incompleta.</li>
              <li><strong>Diritto alla cancellazione (diritto all'oblio)</strong>: Avete il diritto di richiedere che cancelliamo i vostri dati personali, in determinate condizioni.</li>
              <li><strong>Diritto alla limitazione del trattamento</strong>: Avete il diritto di richiedere che limitiamo il trattamento dei vostri dati personali, in determinate condizioni.</li>
              <li><strong>Diritto alla portabilità dei dati</strong>: Avete il diritto di richiedere che trasferiamo i dati che abbiamo raccolto a un'altra organizzazione, o direttamente a voi, in determinate condizioni.</li>
              <li><strong>Diritto di opposizione</strong>: Avete il diritto di opporvi al nostro trattamento dei vostri dati personali, in determinate condizioni.</li>
              <li><strong>Diritto in relazione al processo decisionale automatizzato e alla profilazione</strong>: Avete il diritto di non essere sottoposti a una decisione basata unicamente sul trattamento automatizzato, compresa la profilazione.</li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">11. Come Esercitare i Vostri Diritti</h2>
            <p>
              Se desiderate esercitare uno qualsiasi dei diritti sopra elencati, potete contattarci utilizzando 
              i dettagli di contatto forniti alla fine di questa Privacy Policy. Non ci sono costi associati 
              all'esercizio dei vostri diritti di protezione dei dati.
            </p>
            <p className="mt-2">
              In particolare, per richiedere la cancellazione dei vostri dati personali, potete inviare una email 
              all'indirizzo claudio.ripoli@gmail.com con oggetto "Richiesta di cancellazione dati" specificando le 
              seguenti informazioni:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Nome completo</li>
              <li>Indirizzo email associato al vostro account</li>
              <li>Qualsiasi altra informazione che possa aiutarci a identificare i vostri dati nei nostri sistemi</li>
            </ul>
            <p className="mt-2">
              Elaboreremo la vostra richiesta entro 30 giorni e vi informeremo una volta completata la cancellazione.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">12. Sicurezza dei Dati</h2>
            <p>
              La sicurezza dei vostri dati è importante per noi, ma ricordate che nessun metodo di trasmissione 
              su Internet o metodo di archiviazione elettronica è sicuro al 100%. Ci sforziamo di utilizzare mezzi 
              commercialmente accettabili per proteggere i vostri dati personali, ma non possiamo garantirne la 
              sicurezza assoluta.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">13. Periodo di Conservazione dei Dati</h2>
            <p>
              Conserveremo i vostri dati personali solo per il tempo necessario agli scopi indicati in questa 
              Privacy Policy. Conserveremo e utilizzeremo i vostri dati personali nella misura necessaria per 
              adempiere ai nostri obblighi legali (ad esempio, se ci viene richiesto di conservare i vostri dati 
              per conformarci alle leggi applicabili), risolvere controversie e far rispettare i nostri accordi 
              e politiche legali.
            </p>
            <p className="mt-2">
              Conserveremo anche i Dati di utilizzo a fini di analisi interna. I Dati di utilizzo vengono generalmente 
              conservati per un periodo di tempo più breve, tranne quando questi dati vengono utilizzati per rafforzare 
              la sicurezza o per migliorare la funzionalità del nostro servizio, o quando siamo legalmente obbligati a 
              conservare questi dati per periodi di tempo più lunghi.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">14. Collegamenti ad Altri Siti</h2>
            <p>
              Il nostro servizio può contenere collegamenti ad altri siti che non sono gestiti da noi. Se cliccate 
              su un link di terze parti, sarete indirizzati al sito di quella terza parte. Vi consigliamo vivamente 
              di rivedere la Privacy Policy di ogni sito che visitate.
            </p>
            <p className="mt-2">
              Non abbiamo alcun controllo e non ci assumiamo alcuna responsabilità per il contenuto, le politiche 
              sulla privacy o le pratiche di qualsiasi sito o servizio di terze parti.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">15. Privacy dei Minori</h2>
            <p>
              Il nostro servizio non si rivolge a minori di 16 anni ("Minori").
            </p>
            <p className="mt-2">
              Non raccogliamo consapevolmente informazioni personali identificabili da minori di 16 anni. 
              Se siete un genitore o un tutore e siete consapevoli che i vostri figli ci hanno fornito dati 
              personali, vi preghiamo di contattarci. Se veniamo a conoscenza del fatto che abbiamo raccolto 
              dati personali da minori senza la verifica del consenso dei genitori, adottiamo misure per 
              rimuovere tali informazioni dai nostri server.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">16. Modifiche alla Privacy Policy</h2>
            <p>
              Potremmo aggiornare la nostra Privacy Policy di tanto in tanto. Vi notificheremo eventuali 
              modifiche pubblicando la nuova Privacy Policy su questa pagina.
            </p>
            <p className="mt-2">
              Vi informeremo via email e/o un avviso prominente sul nostro servizio, prima che la modifica 
              diventi efficace e aggiorneremo la "data dell'ultimo aggiornamento" nella parte superiore di 
              questa Privacy Policy.
            </p>
            <p className="mt-2">
              Vi consigliamo di rivedere periodicamente questa Privacy Policy per eventuali modifiche. 
              Le modifiche a questa Privacy Policy sono efficaci quando vengono pubblicate su questa pagina.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">17. Contatti</h2>
            <p>Se avete domande sulla presente Privacy Policy, potete contattarci:</p>
            <ul className="list-none pl-0 mt-2 space-y-2">
              <li>Via e-mail: claudio.ripoli@gmail.com</li>
              <li>Via posta: Claudio Ripoli, Via Paolo Savi 12 A, 51015 Montecatini Terme (PT), Italia</li>
            </ul>
          </section>
        </div>
      </Container>
      <Footer />
    </main>
  );
}