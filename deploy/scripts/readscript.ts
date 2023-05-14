
export function randomGuccini():string{
    const lines=guccini.split('\n\n');
    const n=Math.floor(Math.random()*lines.length);
    const line = lines[n];
    return `"${line}" - Francesco Guccini`;
}

export function randomBattisti():string{
    const lines=lucio.split('\n\n');
    const n=Math.floor(Math.random()*lines.length);
    const line = lines[n];
    return `"${line}" - Lucio Battisti`;
}


const guccini = `Son morto con altri cento, son morto ch' ero bambino, passato per il camino e adesso sono nel vento e adesso sono nel vento.... 

Ad Auschwitz c'era la neve, il fumo saliva lento nel freddo giorno d' inverno e adesso sono nel vento, adesso sono nel vento... 

Ad Auschwitz tante persone, ma un solo grande silenzio: è strano non riesco ancora a sorridere qui nel vento, a sorridere qui nel vento... 

Io chiedo come può un uomo uccidere un suo fratello 

eppure siamo a milioni in polvere qui nel vento, in polvere qui nel vento... 

Ancora tuona il cannone, ancora non è contento di sangue la belva umana e ancora ci porta il vento e ancora ci porta il vento... 

Io chiedo quando sarà che l' uomo potrà imparare a vivere senza ammazzare e il vento si poserà e il vento si poserà... 

Io chiedo quando sarà che l' uomo potrà imparare a vivere senza ammazzare e il vento si poserà e il vento si poserà e il vento si poserà...	`

const lucio = `In un mondo che
Non ci vuole più
Il mio canto libero sei tu
E l'immensità
Si apre intorno a noi
Al di là del limite degli occhi tuoi

Nasce il sentimento
Nasce in mezzo al pianto
E s'innalza altissimo e va

E vola sulle accuse della gente
A tutti i suoi retaggi indifferente
Sorretto da un anelito d'amore
Di vero amore

In un mondo che (pietre, un giorno case)
Prigioniero è (ricoperte dalle rose selvatiche)
Respiriamo liberi io e te (rivivono, ci chiamano)
E la verità (boschi abbandonati)
Si offre nuda a noi (e perciò sopravvissuti, vergini)
E limpida è l'immagine (si aprono)
Ormai (ci abbracciano)

Nuove sensazioni
Giovani emozioni
Si esprimono purissime
In noi
La veste dei fantasmi del passato
Cadendo lascia il quadro immacolato
E s'alza un vento tiepido d'amore

Di vero amore
E riscopro te

Dolce compagna che
Non sai domandare ma sai
Che ovunque andrai
Al fianco tuo mi avrai
Se tu lo vuoi

Pietre un giorno case
Ricoperte dalle rose selvatiche
Rivivono
Ci chiamano
Boschi abbandonati
E perciò sopravvissuti vergini
Si aprono
Ci abbracciano

In un mondo che
Prigioniero è
Respiriamo liberi
Io e te
E la verità
Si offre nuda a noi
E limpida è l'immagine
Ormai

Nuove sensazioni
Giovani emozioni
Si esprimono purissime In noi
La veste dei fantasmi del passato
Cadendo lascia il quadro immacolato
E s'alza un vento tiepido d'amore
Di vero amore
E riscopro te`