import { Container } from "@/components/container";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Cookie Policy | MST",
  description: "Informativa sull'utilizzo dei cookie e delle tecnologie di tracciamento",
};

export default function CookiePolicy() {
  return (
    <main className="min-h-screen w-full bg-black text-white">
      <Container className="py-12 relative z-20" maxWidth="standardized">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">Data dell'ultimo aggiornamento: 12 aprile 2025</p>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">1. Introduzione</h2>
            <p>
              La presente Cookie Policy spiega cosa sono i cookie, come MST utilizza i cookie e tecnologie di tracciamento simili 
              sul sito web e quali opzioni avete in relazione a tali cookie e tecnologie. Questa Cookie Policy è parte integrante 
              della nostra Privacy Policy e dei nostri Termini di utilizzo.
            </p>
            <p>
              Leggendo e continuando a utilizzare il nostro sito, acconsentite all'uso dei cookie in conformità con la presente 
              Cookie Policy.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">2. Cosa sono i Cookie</h2>
            <p>
              I cookie sono piccoli file di testo che vengono archiviati sul vostro computer, tablet, telefono cellulare 
              o altro dispositivo quando visitate un sito web. I cookie contengono informazioni che vengono trasferite 
              al disco rigido del vostro dispositivo. I web beacon, pixel e altre tecnologie simili possono anche essere 
              utilizzati per scopi analoghi a quelli dei cookie.
            </p>
            <p className="mt-2">
              I cookie permettono al nostro sito web di "ricordare" le vostre azioni o preferenze nel tempo, aiutandoci 
              a personalizzare la vostra esperienza utente. Possono anche essere utilizzati per analizzare il traffico, 
              per scopi pubblicitari e di marketing.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">3. Tipi di Cookie che Utilizziamo</h2>
            <p>
              Sul nostro sito utilizziamo diversi tipi di cookie, che possiamo classificare come segue:
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2">3.1 In base alla durata:</h3>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Cookie di sessione</strong>: Sono cookie temporanei che rimangono sul vostro dispositivo fino a quando 
                non chiudete il browser. Quando chiudete il browser e terminate la sessione, tutti i cookie di sessione vengono eliminati.
              </li>
              <li>
                <strong>Cookie persistenti</strong>: Rimangono sul vostro dispositivo fino a quando non scadono o finché non li 
                eliminate. Sono utilizzati per ricordare le vostre preferenze sul nostro sito, in modo da non doverle reimpostare quando lo visitate nuovamente.
              </li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">3.2 In base alla provenienza:</h3>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Cookie di prima parte</strong>: Sono cookie impostati dal nostro sito web.
              </li>
              <li>
                <strong>Cookie di terze parti</strong>: Sono cookie impostati da domini diversi dal nostro. Questi cookie 
                consentono a terze parti di raccogliere e monitorare determinati dati personali, come le vostre attività online nel tempo e su siti web diversi.
              </li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">3.3 In base alla finalità:</h3>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Cookie necessari/tecnici</strong>: Sono essenziali per il funzionamento del nostro sito web. 
                Vi permettono di navigare e utilizzare le sue funzionalità, come accedere ad aree sicure. Senza questi 
                cookie, alcune parti del nostro sito non possono funzionare correttamente.
              </li>
              <li>
                <strong>Cookie di preferenza/funzionalità</strong>: Ci permettono di ricordare le vostre preferenze e 
                personalizzazioni, come la lingua preferita o la regione in cui vi trovate.
              </li>
              <li>
                <strong>Cookie statistici/analitici</strong>: Ci aiutano a capire come i visitatori interagiscono con il 
                nostro sito raccogliendo e riportando informazioni in forma anonima. Utilizziamo questi dati per migliorare il nostro sito.
              </li>
              <li>
                <strong>Cookie di marketing/pubblicitari</strong>: Sono utilizzati per tracciare i visitatori attraverso i 
                siti web. L'intento è quello di visualizzare annunci pertinenti e coinvolgenti per il singolo utente e 
                quindi più preziosi per gli editori e gli inserzionisti terzi.
              </li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">4. Tecnologie di Tracciamento Specifiche che Utilizziamo</h2>
            <p>
              In particolare, utilizziamo le seguenti tecnologie di tracciamento sul nostro sito:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Pixel di Meta (Facebook)</strong>: Il pixel di Meta è uno strumento di analisi che ci aiuta a 
                misurare l'efficacia delle nostre pubblicità monitorando le azioni che gli utenti intraprendono sul nostro 
                sito web. Utilizziamo queste informazioni per mostrarvi annunci pertinenti su Facebook, Instagram e altre 
                piattaforme di Meta e per misurare le interazioni con i nostri annunci. Il pixel raccoglie dati come il 
                vostro indirizzo IP, il tipo di browser, il sistema operativo, l'URL di riferimento, l'orario di visita, 
                e altre informazioni tecniche. Per maggiori informazioni sul pixel di Meta e su come Meta utilizza i vostri 
                dati, vi invitiamo a consultare la Politica sui dati di Meta.
              </li>
              <li>
                <strong>Google Analytics</strong>: Utilizziamo Google Analytics per comprendere come i visitatori interagiscono 
                con il nostro sito. Google Analytics utilizza i cookie per raccogliere informazioni e generare statistiche 
                sull'utilizzo del sito web senza identificare personalmente i singoli visitatori. Le informazioni generate 
                dai cookie di Google Analytics sul vostro utilizzo del nostro sito web (compreso il vostro indirizzo IP) 
                saranno trasmesse e memorizzate da Google. Per maggiori informazioni su come Google Analytics raccoglie e 
                processa i dati, consultate: "Come Google utilizza i dati quando utilizzate siti o app dei nostri partner".
              </li>
              <li>
                <strong>Google Ads</strong>: Utilizziamo i cookie di Google Ads per monitorare le conversioni dalle nostre 
                campagne pubblicitarie Google e per remarketing verso gli utenti che hanno visitato determinate pagine sul 
                nostro sito. Questi cookie permettono a Google di mostrarvi i nostri annunci quando cercate prodotti o 
                servizi simili a quelli presenti sul nostro sito.
              </li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">5. Base Giuridica per l'Utilizzo dei Cookie</h2>
            <p>
              La base giuridica per l'utilizzo di cookie e tecnologie simili sul nostro sito web varia a seconda della finalità:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Cookie necessari/tecnici</strong>: Utilizziamo questi cookie sulla base del nostro legittimo interesse a 
                garantire il funzionamento tecnico del nostro sito web e a fornirvi le funzionalità richieste. Questi cookie non 
                richiedono il vostro consenso in quanto sono essenziali per il funzionamento del nostro sito.
              </li>
              <li>
                <strong>Cookie di preferenza, statisti e di marketing</strong>: Per questi tipi di cookie, ci basiamo sul vostro 
                consenso, che potete fornire attraverso il nostro banner dei cookie o tramite le impostazioni del vostro browser.
              </li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">6. Come Gestire i Cookie</h2>
            <p>
              Avete il diritto di decidere se accettare o rifiutare i cookie. Potete esercitare le vostre preferenze 
              in materia di cookie nei seguenti modi:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Tramite le impostazioni del browser</strong>: La maggior parte dei browser web consente di 
                controllare i cookie attraverso le impostazioni di preferenza. Per sapere come gestire i cookie nel 
                vostro browser, cliccate su uno dei seguenti link:
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Microsoft Edge</a></li>
                  <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Safari</a></li>
                </ul>
              </li>
              <li>
                <strong>Tramite il nostro banner dei cookie</strong>: Quando visitate il nostro sito per la prima volta, 
                vi viene presentato un banner dei cookie che vi permette di accettare o rifiutare i diversi tipi di cookie 
                che utilizziamo. Potete modificare le vostre preferenze in qualsiasi momento cliccando sul link "Preferenze 
                Cookie" presente nel footer del nostro sito.
              </li>
              <li>
                <strong>Opt-out specifici per strumenti di terze parti</strong>:
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Google Analytics: Potete disattivare Google Analytics installando il <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">componente aggiuntivo di opt-out fornito da Google</a>.</li>
                  <li>Meta Pixel: Potete gestire la visualizzazione degli annunci personalizzati di Meta visitando le <a href="https://www.facebook.com/settings/?tab=ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">impostazioni degli annunci di Facebook</a>.</li>
                  <li>Google Ads: Potete disattivare la personalizzazione degli annunci Google visitando le <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">impostazioni degli annunci di Google</a>.</li>
                </ul>
              </li>
            </ul>
            <p className="mt-4">
              Si prega di notare che se scegliete di bloccare o rifiutare i cookie, alcune funzionalità e servizi del 
              nostro sito web potrebbero non funzionare correttamente. Inoltre, se avete precedentemente accettato i 
              nostri cookie e desiderate rimuoverli, potete eliminarli attraverso le impostazioni del vostro browser.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">7. Cookie di Terze Parti</h2>
            <p>
              Il nostro sito include funzionalità fornite da terze parti, in particolare per scopi analitici e pubblicitari. 
              Questi terzi possono ricevere dati sul vostro utilizzo del nostro sito web.
            </p>
            <p className="mt-2">
              Questi terzi possono utilizzare cookie, alone o in combinazione con web beacon o altre tecnologie di 
              tracciamento, per raccogliere informazioni su di voi quando utilizzate il nostro sito web. Le informazioni 
              che raccolgono possono essere associate alla vostra persona, oppure potrebbero raccogliere informazioni, 
              inclusi dati personali, sulle vostre attività online nel tempo e su diversi siti web e altri servizi online.
            </p>
            <p className="mt-2">
              Non controlliamo questi cookie di terze parti o come tali terze parti utilizzano i loro cookie. Se desiderate 
              ulteriori informazioni su questi cookie e su come disattivarli, consultate la privacy policy e le informative 
              sui cookie di tali terze parti.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">8. Trasferimento Internazionale dei Dati</h2>
            <p>
              Le informazioni raccolte attraverso i cookie possono essere archiviate ed elaborate in Italia o in qualsiasi 
              altro paese in cui noi o i nostri fornitori di servizi manteniamo delle strutture. Adottiamo misure per 
              garantire che i dati raccolti ai sensi della presente Informativa sui cookie siano trattati secondo le 
              disposizioni della presente Informativa e i requisiti della legge applicabile ovunque si trovino i dati.
            </p>
            <p className="mt-2">
              Quando trasferiamo le vostre informazioni personali al di fuori dello Spazio Economico Europeo, ci assicuriamo 
              che sia protetto in modo simile garantendo che almeno una delle seguenti misure di sicurezza sia implementata:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                Trasferiremo i dati solo a paesi che sono stati ritenuti in grado di fornire un adeguato livello di 
                protezione per i dati personali dalla Commissione Europea;
              </li>
              <li>
                Dove utilizziamo determinati fornitori di servizi, potremmo utilizzare contratti specifici approvati 
                dalla Commissione Europea che offrono ai dati personali la stessa protezione che hanno in Europa.
              </li>
              <li>
                Dove utilizziamo fornitori con sede negli Stati Uniti, potremmo trasferire i dati a loro se fanno 
                parte del Privacy Shield che richiede loro di fornire una protezione simile ai dati personali condivisi 
                tra l'Europa e gli Stati Uniti.
              </li>
            </ul>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">9. Modifiche alla Cookie Policy</h2>
            <p>
              Potremmo aggiornare la nostra Cookie Policy di tanto in tanto. Vi informeremo di qualsiasi modifica 
              pubblicando la nuova Cookie Policy su questa pagina e, se le modifiche sono significative, vi forniremo 
              un avviso più prominente. Vi invitiamo a controllare periodicamente questa pagina per eventuali modifiche.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">10. Contatti</h2>
            <p>
              Se avete domande sulla presente Cookie Policy, potete contattarci:
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