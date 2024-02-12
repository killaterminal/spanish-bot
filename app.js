const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

mongoose.connect('mongodb+srv://dart-hit:qwerty123zxc34@cluster0.ap1ucz1.mongodb.net/spanish-bot', { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

connection.once('open', () => {
    console.log('Connected to MongoDB');
});

const token = '6856597952:AAF6IGv0_ir1Vi-JfaDmzVjAtpQfY8uqb8o';

const bot = new TelegramBot(token, { polling: true });

const chatLink = `https://t.me/@luizbernor`;

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name;

    User.findOne({ chatId: chatId })
        .then((existingUser) => {
            if (existingUser) {
                console.log('Пользователь уже существует:', `${existingUser} \nMsg ID:${msg.chat.id} - UserID: ${existingUser.chatId}`);
                return;
            }
            const newUser = new User({
                firstName: msg.from.first_name,
                lastName: msg.from.last_name,
                username: msg.from.username,
                chatId: msg.chat.id,
                directed: false
            });

            newUser.save()
                .then((savedUser) => {
                    console.log('Пользователь сохранён:', savedUser);
                })
                .catch((error) => {
                    console.error('Ошибка при сохранении пользователя', error);
                });
        })
        .catch((error) => {
            console.error('Ошибка при поиске пользователя:', error);
        });

    bot.getMe().then((me) => {
        const botName = me.first_name;

        const videoNoteFilePath = 'source/preview-video.mp4';
        const videoCaption = `Ciao 👋 ${userName}\n\n` +
            `Piacere di conoscervi, il mio nome è ${botName}.\n\n` +
            'Il fatto è che siete arrivati qui per un motivo. Avete un desiderio folle di guadagnare molto denaro. Mi piacerebbe aiutarti in questa impresa.\n\n' +
            'Sono onorata di vedere che i miei sforzi fanno la differenza nella vita di altre persone. Tutti coloro che avevano debiti li hanno saldati e hanno iniziato una nuova vita.\n\n' +
            'Le persone del mio team hanno famiglie numerose e non hanno bisogno di nulla.\n\n' +
            'Questo mi rende felice, e aiuterò anche VOI ad arricchirvi!';

        const videoOptions = {
            caption: videoCaption,
        };

        const keyboard = {
            inline_keyboard: [
                [{ text: 'Scrivimi a ✍️', callback_data: 'escribeme_command', url: chatLink }],
                [{ text: 'Come funziona il programma', callback_data: 'como_funciona_el_programa' }],
            ],
        };

        videoOptions.reply_markup = keyboard;

        bot.sendDocument(chatId, videoNoteFilePath, videoOptions).catch((error) => {
            console.error(error);
        });
    }).catch((error) => {
        console.error(error);
    });
});


async function comoTestimonios(chatId, callbackQuery) {
    try {
        function isPhoto(fileUrl) {
            return fileUrl.endsWith('.jpg') || fileUrl.endsWith('.jpeg') || fileUrl.endsWith('.png');
        }

        const reviews = await Reviews.find({});

        console.log('Reviews:', reviews);

        for (const review of reviews) {
            const fileUrl = review.file;
            const videoCaption = review.text;

            console.log('File URL:', fileUrl);
            console.log('Video Caption:', videoCaption);

            const videoOptions = {
                caption: videoCaption,
            };

            if (isPhoto(fileUrl)) {
                await bot.sendPhoto(chatId, fileUrl, videoOptions);
            } else {
                await bot.sendDocument(chatId, fileUrl, videoOptions);
            }
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }

    bot.answerCallbackQuery(callbackQuery.id);
}

async function comoFuncionaElPrograma(chatId, callbackQuery) {
    const videoNoteFilePath = 'source/reg-video.mp4';

    const videoCaption = `È ora di cambiare vita ❤️🫂.\n\n` +
        'L`essenza è semplice: l`app predice il punto di partenza dell`aereo e lo fa sempre con precisione. Quello che vedete sullo schermo è il moltiplicatore per il quale verrà moltiplicata la vostra puntata.\n\n' +
        'È possibile ottenere questa applicazione gratuitamente per 7 giorni.\n\n' +
        'Per farlo, è necessario accettare i nostri accordi con gli utenti:\n\n' +
        '1) Confermo che non preleverò importi superiori al limite consentito dall`autorità di vigilanza del mio paese.\n\n' +
        '2) Confermo di non avere dipendenza dal gioco d`azzardo e di essere disposto a fare tutto con cura e attenzione.\n\n' +
        'Registro';

    const videoOptions = {
        caption: videoCaption,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Scrivimi a ✍️', callback_data: 'escribeme_command', url: chatLink }],
                [{ text: 'Testimonianze', callback_data: 'testimonials' }],
            ],
        },
    };

    bot.sendDocument(chatId, videoNoteFilePath, videoOptions).catch((error) => {
        console.error(error);
    });

    bot.answerCallbackQuery(callbackQuery.id);
}

bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    if (action === 'como_funciona_el_programa') {
        comoFuncionaElPrograma(chatId, callbackQuery);
    } else if (action === 'testimonials') {
        comoTestimonios(chatId, callbackQuery);
    }
});

const reviewSchema = new mongoose.Schema({
    _id: ObjectId,
    file: String,
    text: String,
});

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    chatId: String,
    directed: Boolean
});

const User = mongoose.model('users', userSchema);
const Reviews = mongoose.model('Review', reviewSchema);

// mongodb+srv://dart-hit:qwerty123zxc34@cluster0.ap1ucz1.mongodb.net/spanish-bot

// const token = '6856597952:AAF6IGv0_ir1Vi-JfaDmzVjAtpQfY8uqb8o';

// const chatLink = `https://t.me/@luizbernor`;


// const videoCaption = `Ciao 👋 ${userName}\n\n` +
//             `Piacere di conoscervi, il mio nome è ${botName}.\n\n` +
//             'Il fatto è che siete arrivati qui per un motivo. Avete un desiderio folle di guadagnare molto denaro. Mi piacerebbe aiutarti in questa impresa.\n\n' +
//             'Sono onorata di vedere che i miei sforzi fanno la differenza nella vita di altre persone. Tutti coloro che avevano debiti li hanno saldati e hanno iniziato una nuova vita.\n\n' +
//             'Le persone del mio team hanno famiglie numerose e non hanno bisogno di nulla.\n\n' +
//             'Questo mi rende felice, e aiuterò anche VOI ad arricchirvi!';

// [{ text: 'Scrivimi a ✍️', callback_data: 'escribeme_command', url: chatLink }],
// [{ text: 'Come funziona il programma', callback_data: 'como_funciona_el_programa' }],



// const videoCaption = `È ora di cambiare vita ❤️🫂.\n\n` +
//         'L`essenza è semplice: l`app predice il punto di partenza dell`aereo e lo fa sempre con precisione. Quello che vedete sullo schermo è il moltiplicatore per il quale verrà moltiplicata la vostra puntata.\n\n' +
//         'È possibile ottenere questa applicazione gratuitamente per 7 giorni.\n\n' +
//         'Per farlo, è necessario accettare i nostri accordi con gli utenti:\n\n' +
//         '1) Confermo che non preleverò importi superiori al limite consentito dall`autorità di vigilanza del mio paese.\n\n' +
//         '2) Confermo di non avere dipendenza dal gioco d`azzardo e di essere disposto a fare tutto con cura e attenzione.\n\n' +
//         'Registro';

// [{ text: 'Scrivimi a ✍️', callback_data: 'escribeme_command', url: chatLink }],
// [{ text: 'Testimonianze', callback_data: 'testimonials' }],
