
export function randomGuccini(): string{
    const lines=guccini.split('\n\n');
    const n=Math.floor(Math.random()*lines.length);
    const line = lines[n];
    return `"${line}" - Francesco Guccini`;
}

export function randomBattisti(): string{
    const lines=lucio.split('\n\n');
    const n=Math.floor(Math.random()*lines.length);
    const line = lines[n];
    return `"${line}" - Lucio Battisti`;
}

export function randomTwits(): string {
    const lines = twits.split('\n\n');
    const n = Math.floor(Math.random() * lines.length);
    return lines[n] as string;
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

const twits = `
Just had the best coffee ever! ☕️ #caffeineaddict

Excited to start my new job tomorrow! #newbeginnings

Can't wait for the weekend! Any fun plans? 🎉

Just finished reading an amazing book. Highly recommend it! 📚 #booklover

Trying out a new recipe tonight. Fingers crossed it turns out delicious! 🍽️ #cookingadventures

It's raining outside, perfect weather to stay in and watch movies all day! 🌧️🎥 #moviemarathon

Had an intense workout at the gym today. Feeling the burn! 💪 #fitnessmotivation

Spent the day exploring a new city. So many hidden gems! 🗺️ #travelbug

Just watched the latest episode of my favorite TV show. Can't believe that cliffhanger ending! 📺 #bingewatching

Finally finished my project! Time to celebrate with some ice cream. 🍦 #success

Here are 100 more Twitter-like posts for your API testing:

Woke up to a beautiful sunrise. Starting the day on a positive note! 🌅 #grateful

Pizza is my love language. 🍕❤️ #pizzalover

Just booked tickets for my dream vacation. Counting down the days! ✈️🌴 #wanderlust

Feeling motivated to crush my goals today. Let's do this! 💪 #MondayMotivation

Spent the afternoon at the beach. Nothing beats the sound of waves. 🏖️🌊 #beachlife

Trying out a new hobby. Learning something new is always exciting! 🎨 #creativity

Rainy days are perfect for cozying up with a good book. 🌧️📚 #bookworm

Attended an inspiring conference today. So many innovative ideas! #inspiration

Just adopted a furry friend. Meet my new buddy! 🐾 #petlover

The best part of weekends is having brunch with friends. 🥞🥂 #brunchtime

Can't believe it's already June! Time flies. ⏰ #timewarp

Movie night with popcorn and friends. Ready for some laughter! 🎬😄 #movienight

Enjoying a lazy Sunday. Sometimes doing nothing is the best plan. #relaxation

Just finished a challenging workout. Sweating like crazy! 💦 #fitnessjourney

Exploring new music and discovering hidden gems. 🎶 #musiclover

Sunday mornings call for pancakes and maple syrup. 🥞❤️ #sundayvibes

Road trip playlist on point! Singing my heart out. 🚗🎶 #roadtripvibes

Had an amazing dinner at a new restaurant. The food was out of this world! 🍽️🌟 #foodie

Nothing beats a good night's sleep. Sweet dreams, everyone! 😴💤 #goodnight

Enjoying a cup of tea and watching the sunset. Blissful moments. 🌇☕️ #serenity

Just finished a challenging workout. Feeling the burn! 💪 #fitnessgoals

Spent the weekend decluttering and organizing. Feels so refreshing! #springcleaning

Just discovered a hidden gem of a coffee shop. Cozy vibes and great brews. ☕️ #coffeelover

Excited for the concert tonight! Ready to dance the night away. 🎵🕺 #livemusic

Productive day at work. Crossing off tasks from my to-do list. ✅ #workmode

Trying out a new recipe. Hoping it turns out delicious! 🍽️ #cookingexperiment

Lazy Sundays call for pajamas and Netflix. Perfect chill day! 📺 #netflixandchill

Celebrating a milestone today. Hard work pays off! 🎉💪 #achievementunlocked

Starting the day with a positive mindset and gratitude. #positivity

Attended an inspiring TED Talk. So many ideas worth spreading! #TEDx

Just bought tickets for my favorite band's concert. Can't wait to rock out! 🤘🎸 #musicfestival

Quality time with loved ones is always a treasure. ❤️ #familytime

Rainy days and a good book are a perfect match. 🌧️📖 #cozyreading

Just discovered a new hiking trail. Nature never fails to amaze me! 🌲🥾 #hikingadventures

Trying out a new workout routine. Feeling the burn already! 🔥💪 #fitnessaddict

Enjoying a picnic in the park. Simple pleasures are the best. 🌳🧺 #picnicvibes

Reflecting on the week and setting new goals for the upcoming one. 📝 #selfimprovement

Spent the day exploring museums. So much art and culture! 🎨🏛️ #artlover

Cheers to Friday! Ready for the weekend shenanigans. 🥂🎉 #weekendvibes

Just finished an intense yoga session. Mind and body feel rejuvenated. 🧘‍♀️💆‍♀️ #yogalife

Celebrating a friend's birthday tonight. Let the party begin! 🎂🎈 #birthdaybash

Late-night cravings got me ordering pizza. No regrets! 🍕😋 #midnightmunchies

Took a day off to unwind and recharge. Self-care is essential. #mentalhealth

Just watched an inspiring documentary. Knowledge is power! 🎥🧠 #documentarylover

Enjoying the summer breeze and the sound of waves crashing. 🌊🌞 #summervibes

Cooking a homemade meal from scratch. The kitchen smells amazing! 🍳🍲 #homemade

Attending a music festival this weekend. Dancing my heart out! 🎶💃 #musiclover

Sunday morning yoga session to start the day with tranquility. 🧘‍♂️☀️ #namaste

Just finished a thrilling book. The plot twists had me hooked! 📚🔀 #bookworm

Trying out a new fashion trend. Stepping out of my comfort zone! 👗👠 #styleinspiration

Certainly! Here are 50 more Twitter-like posts for your API testing:

Enjoying a cup of coffee while watching the sunrise. Perfect way to start the day! ☕️🌅 #morningroutine

Just finished a challenging workout. Feeling the endorphin rush! 💪🔥 #fitnessmotivation

Exploring the local farmer's market. Fresh produce galore! 🥦🍓 #farmersmarketfinds

Movie marathon night with friends. Snacks and laughter guaranteed! 🍿🎥 #movienight

Trying out a new dessert recipe. Can't wait to indulge in a sweet treat! 🍰🍫 #dessertlover

Celebrating a personal milestone today. Proud of my progress! 🎉🙌 #personalachievement

Enjoying a scenic hike in the mountains. Nature's beauty is awe-inspiring. ⛰️🌿 #hikingadventures

Just finished a gripping novel. The plot twists kept me on the edge of my seat! 📖🔥 #pageturner

Date night at a cozy restaurant. Good food and even better company! 🍽️❤️ #datenight

Late-night coding session in progress. Solving problems one line at a time. 💻👩‍💻 #programminglife

Sunday morning spent journaling and reflecting. Self-reflection is key to personal growth. 📓✨ #selfcare

Attended an inspiring TEDx talk today. Ideas worth spreading! 🎤🌟 #TEDx

Just booked tickets for an upcoming music concert. Anticipation levels are high! 🎵🎉 #concertbuzz

Enjoying a beach day with friends. Sun, sand, and laughter. 🏖️🌞 #beachvibes

Trying out a new workout class. The burn is real! 💦💪 #fitnessjourney

Sunday brunch with loved ones. Good food and great conversations! 🥐🥂 #brunchdate

Just finished a productive work session. Accomplishments unlocked! ✅🎯 #productivity

Spent the weekend exploring a new city. So much to see and discover! 🌆🗺️ #wanderlust

Movie night at home with a cozy blanket and popcorn. Pure relaxation! 🎬🍿 #moviemarathon

Celebrating a friend's engagement. Love is in the air! 💍❤️ #engagementparty

Taking a break to enjoy a refreshing smoothie. Fueling up with deliciousness

Coffee + sunshine = perfect morning! ☕️🌞 #morningvibes

Music has the power to heal. 🎶❤️ #musictherapy

Embracing change with open arms. 🌟 #growthmindset

Beach day vibes. 🏖️🌊 #summertime

Laughter is the best medicine. 😄💕 #joyfulmoments

Grateful for good friends and great conversations. 👭💬 #friendshipgoals

Life is too short for regrets. Carpe diem! ⏳✨ #noregrets

Stay focused. Stay determined. Success will follow. 💪🔥 #goalsetter

Rainy days are for cozying up with a book. 🌧️📚 #bookwormlife

Celebrating the little victories. 🎉✨ #smallwins

On top of the world! 🌍⛰️ #adventureawaits

Just witnessed a breathtaking sunset. Nature's artwork. 🌅🎨 #sunsetlovers

Smiles are contagious. Spread them generously. 😊❤️ #positivity

Life's greatest adventures begin outside our comfort zone. 🌟 #stepoutboldly

Gratitude turns what we have into enough. 🙏💫 #gratefulheart

Dreams don't work unless you do. 💫💪 #dreambig

Time spent with loved ones is never wasted. ❤️ #familyfirst

Just discovered a hidden gem of a café. Coffee bliss! ☕️✨ #coffeelovers

Enjoying the simple pleasure of a warm

Reflecting on the past year, I realize how much I've grown both personally and professionally. It hasn't been easy, but every challenge has shaped me into a stronger individual. Here's to embracing new opportunities and continuing on the path of self-improvement in the coming year! #reflection #personalgrowth #newbeginnings

Just returned from an incredible adventure in Southeast Asia. From exploring ancient temples to immersing myself in vibrant cultures, every moment was a feast for the senses. Grateful for the memories made and the friendships formed along the way. Travel truly opens our hearts and minds. #travelbug #wanderlust #adventureawaits

Sometimes we get so caught up in the fast-paced nature of life that we forget to pause and appreciate the little things. The sound of raindrops on a window, the warmth of a loved one's embrace, the scent of freshly brewed coffee - these simple pleasures are what make life beautiful. Let's cherish them. #gratitude #simplepleasures #mindfulness

The power of education is immeasurable. It has the ability to transform lives, break down barriers, and create a better future for all. As we celebrate World Education Day, let's reaffirm our commitment to providing quality education for every child. Together, we can build a more inclusive and equitable world. #WorldEducationDay #educationmatters #learningforall

In a world full of noise and distractions, finding moments of solitude is essential for our well-being. Whether it's taking a walk in nature, meditating in silence, or simply disconnecting from technology, embracing solitude allows us to reconnect with ourselves, find inner peace, and foster self-discovery. #solitude #innerpeace #selfreflection
`
