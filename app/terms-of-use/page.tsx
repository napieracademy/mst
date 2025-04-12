import { Container } from "@/components/container";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const metadata = {
  title: "Termini di Utilizzo | MST",
  description: "Termini e condizioni per l'utilizzo del servizio",
};

export default function TermsOfUse() {
  return (
    <main className="min-h-screen w-full bg-black text-white">
      <Header />
      <Container className="pt-24 pb-12 relative z-20" maxWidth="standardized">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Termini di Utilizzo</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">Data dell'ultimo aggiornamento: 12 aprile 2025</p>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">1. Introduzione</h2>
            <p>
              Benvenuti su MST. I presenti termini e condizioni descrivono le regole e i regolamenti per l'utilizzo 
              del nostro sito web.
            </p>
            <p>
              Accedendo a questo sito web, assumiamo che accettiate questi termini e condizioni nella loro interezza. 
              Non continuate a utilizzare MST se non accettate tutti i termini e le condizioni indicati in questa pagina.
            </p>
            <p>
              La seguente terminologia si applica ai presenti Termini e Condizioni, all'Informativa sulla Privacy e 
              all'Avviso di Esclusione di Responsabilità e a tutti gli Accordi: "Cliente", "Voi" e "Vostro" si riferiscono 
              a voi, la persona che accede a questo sito web e che accetta i termini e le condizioni della Società. 
              "La Società", "Noi stessi", "Noi", "Nostro" e "Noi" si riferiscono alla nostra Società. "Parte", "Parti" 
              o "Noi" si riferisce sia al Cliente che a noi stessi, o al Cliente o a noi stessi.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">2. Utilizzo del Sito</h2>
            <p>
              L'utilizzo di questo sito web è soggetto ai seguenti termini di utilizzo:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                Il contenuto delle pagine di questo sito web è destinato esclusivamente a vostra informazione generale 
                e utilizzo. È soggetto a modifiche senza preavviso.
              </li>
              <li>
                Questo sito web utilizza cookie per monitorare le preferenze di navigazione. Se consentite l'uso dei 
                cookie in conformità con la nostra Cookie Policy, accettate l'uso dei cookie in relazione al vostro 
                utilizzo di questo sito web.
              </li>
              <li>
                Né noi né terze parti forniamo alcuna garanzia o assicurazione sulla precisione, tempestività, 
                prestazioni, completezza o idoneità delle informazioni e dei materiali trovati o offerti su questo 
                sito web per qualsiasi scopo particolare. Riconoscete che tali informazioni e materiali possono 
                contenere imprecisioni o errori e escludiamo espressamente la responsabilità per tali imprecisioni 
                o errori nella misura massima consentita dalla legge.
              </li>
              <li>
                L'utilizzo di qualsiasi informazione o materiale su questo sito web è interamente a vostro rischio, 
                per il quale non saremo responsabili. Sarà vostra responsabilità assicurarvi che qualsiasi prodotto, 
                servizio o informazione disponibile attraverso questo sito web soddisfi i vostri requisiti specifici.
              </li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">3. Proprietà Intellettuale</h2>
            <p>
              Questo sito web contiene materiale che è di nostra proprietà o concesso in licenza a noi. Questo materiale include, 
              ma non è limitato a, il design, il layout, l'aspetto, l'apparenza e la grafica. La riproduzione è proibita se non 
              in conformità con l'avviso di copyright, che fa parte di questi termini e condizioni.
            </p>
            <p className="mt-2">
              Tutti i marchi riprodotti in questo sito web che non sono di proprietà di o concessi in licenza al gestore sono 
              riconosciuti sul sito web.
            </p>
            <p className="mt-2">
              L'uso non autorizzato di questo sito web può dar luogo a una richiesta di risarcimento danni e/o costituire 
              un reato.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">4. Limitazioni di Responsabilità</h2>
            <p>
              In nessun caso saremo responsabili per qualsiasi perdita o danno inclusi, senza limitazione, perdite o danni 
              indiretti o consequenziali, o qualsiasi perdita o danno derivante dalla perdita di dati o profitti derivanti 
              da o in connessione con l'uso di questo sito web.
            </p>
            <p className="mt-2">
              Attraverso questo sito web potreste essere in grado di collegarvi ad altri siti web che non sono sotto il 
              nostro controllo. Non abbiamo alcun controllo sulla natura, il contenuto e la disponibilità di quei siti. 
              L'inclusione di qualsiasi link non implica necessariamente una raccomandazione o un'approvazione delle opinioni 
              espresse all'interno di essi.
            </p>
            <p className="mt-2">
              Ogni sforzo è fatto per mantenere il sito web funzionante regolarmente. Tuttavia, non ci assumiamo alcuna 
              responsabilità per, e non saremo responsabili per, il sito web che è temporaneamente non disponibile a causa 
              di problemi tecnici al di fuori del nostro controllo.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">5. Account Utente</h2>
            <p>
              Quando create un account con noi, garantite che le informazioni che ci fornite sono accurate, complete e 
              aggiornate in ogni momento. Informazioni inaccurate, incomplete o obsolete possono comportare la cessazione 
              immediata del vostro account sul nostro servizio.
            </p>
            <p className="mt-2">
              Siete responsabili di salvaguardare la password che utilizzate per accedere al servizio e per qualsiasi 
              attività o azione sotto la vostra password, che la vostra password sia con il nostro servizio o un servizio 
              di terze parti.
            </p>
            <p className="mt-2">
              Accettate di non divulgare la vostra password a terze parti. Dovete notificarci immediatamente dopo essere 
              venuti a conoscenza di qualsiasi violazione della sicurezza o uso non autorizzato del vostro account.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">6. Collegamenti ad Altri Siti Web</h2>
            <p>
              Il nostro servizio può contenere collegamenti a siti web o servizi di terze parti che non sono di proprietà 
              o controllati da noi.
            </p>
            <p className="mt-2">
              Non abbiamo alcun controllo su, e non ci assumiamo alcuna responsabilità per, il contenuto, le politiche 
              sulla privacy o le pratiche di qualsiasi sito web o servizio di terze parti. Inoltre, riconoscete e accettate 
              che non saremo responsabili o responsabili, direttamente o indirettamente, per qualsiasi danno o perdita 
              causati o presunti causati da o in connessione con l'uso o l'affidamento su tali contenuti, beni o servizi 
              disponibili su o attraverso tali siti web o servizi.
            </p>
            <p className="mt-2">
              Vi consigliamo vivamente di leggere i termini e le condizioni e le politiche sulla privacy di qualsiasi 
              sito web o servizio di terze parti che visitate.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">7. Terminazione</h2>
            <p>
              Possiamo terminare o sospendere il vostro account immediatamente, senza preavviso o responsabilità, per 
              qualsiasi motivo, incluso, senza limitazione, se violate i Termini di Utilizzo.
            </p>
            <p className="mt-2">
              Al momento della terminazione, il vostro diritto di utilizzare il servizio cesserà immediatamente. 
              Se desiderate terminare il vostro account, potete semplicemente interrompere l'utilizzo del servizio.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">8. Indennizzo</h2>
            <p>
              Accettate di difendere, indennizzare e tenere indenne noi e i nostri licenzianti e licenziatari, e i loro 
              dipendenti, appaltatori, agenti, funzionari e direttori, da e contro qualsiasi rivendicazione, danno, 
              obbligo, perdita, responsabilità, costo o debito, e spese (inclusi ma non limitati agli onorari degli 
              avvocati) derivanti da: (i) il vostro utilizzo e accesso al servizio, da parte vostra o di qualsiasi 
              persona utilizzando il vostro account e password; (ii) una violazione di questi Termini, o (iii) una 
              violazione di qualsiasi diritto di terze parti, inclusi senza limitazione qualsiasi diritto d'autore, 
              proprietà o diritto alla privacy.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">9. Limitazione di Responsabilità</h2>
            <p>
              In nessun caso saremo responsabili per qualsiasi danno indiretto, punitivo, incidentale, speciale, 
              consequenziale o esemplare, inclusi senza limitazione, danni per perdita di profitti, avviamento, 
              utilizzo, dati o altre perdite intangibili, derivanti da o relative a questi termini di utilizzo, 
              sia basati sulla garanzia, sul contratto, sul torto (inclusa la negligenza), sullo statuto o altro, 
              indipendentemente dal fatto che siamo stati informati della possibilità di tali danni.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">10. Esclusione di Garanzie</h2>
            <p>
              Il vostro utilizzo del servizio è a vostro rischio. Il servizio è fornito "COSÌ COM'È" e "COME DISPONIBILE". 
              Il servizio è fornito senza garanzie di alcun tipo, sia espresse che implicite, incluse, ma non limitate a, 
              garanzie implicite di commerciabilità, idoneità per un particolare scopo, non violazione o esecuzione del corso.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">11. Legge Applicabile</h2>
            <p>
              Questi termini saranno regolati e interpretati in conformità con le leggi italiane, senza riguardo alle 
              sue disposizioni sui conflitti di legge.
            </p>
            <p className="mt-2">
              La nostra incapacità di far valere qualsiasi diritto o disposizione di questi Termini non sarà considerata 
              una rinuncia a tali diritti. Se qualsiasi disposizione di questi Termini è ritenuta non valida o inapplicabile 
              da un tribunale, le restanti disposizioni di questi Termini rimarranno in vigore.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">12. Modifiche ai Termini</h2>
            <p>
              Ci riserviamo il diritto, a nostra esclusiva discrezione, di modificare o sostituire questi Termini in 
              qualsiasi momento. In caso di una revisione, aggiorneremo la data dell'ultimo aggiornamento nella parte 
              superiore di questa pagina. Ciò che costituisce un cambiamento sostanziale sarà determinato a nostra 
              esclusiva discrezione.
            </p>
            <p className="mt-2">
              Continuando ad accedere o utilizzare il nostro servizio dopo che tali revisioni diventano effettive, 
              accettate di essere vincolati dai termini rivisti. Se non accettate i nuovi termini, non siete più 
              autorizzati a utilizzare il servizio.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">13. Contenuti degli Utenti</h2>
            <p>
              Il nostro servizio consente di pubblicare, collegare, archiviare, condividere e rendere disponibili 
              determinate informazioni, testi, grafici, video o altri materiali ("Contenuto"). Siete responsabili del 
              Contenuto che pubblicate sul nostro servizio, inclusa la sua legalità, affidabilità e appropriatezza.
            </p>
            <p className="mt-2">
              Pubblicando Contenuti sul nostro servizio, ci concedete il diritto e la licenza di utilizzare, modificare, 
              eseguire pubblicamente, mostrare pubblicamente, riprodurre e distribuire tale Contenuto sul e attraverso il 
              servizio. Mantenete tutti i vostri diritti sul Contenuto che pubblicate, ma ci concedete una licenza per 
              utilizzare tale Contenuto sul nostro servizio.
            </p>
            <p className="mt-2">
              Dichiarate e garantite che: (i) il Contenuto è vostro o avete il diritto di utilizzarlo e concedere a noi i 
              diritti e la licenza come previsto in questi Termini, e (ii) la pubblicazione del vostro Contenuto sul o 
              attraverso il servizio non viola i diritti alla privacy, i diritti di pubblicità, i diritti d'autore, i 
              diritti contrattuali o qualsiasi altro diritto di qualsiasi persona.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">14. Contatti</h2>
            <p>
              Se avete domande sui presenti Termini di Utilizzo, potete contattarci:
            </p>
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