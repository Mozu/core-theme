var util = require('util'),
    cliColor = require('cli-color'),
    // Stephen Patrick Morrissey in 15 lines, more or less.
    admissions = [
        '%s\n Lord knows, it would be the first time.',
        'Good times, for a change.\n %s',
        "%s\n I am now a central part of your mind's landscape, whether you care or do not.",
        "When you sleep, I will creep into your thoughts.\n %s",
        'All men have secrets, and here is mine.\n %s',
        '%s\n Oh, Keats and Yeats are on your side.',
        '%s\n The good life is out there somewhere, so stay on my arm, you little charmer.',
        "%s\n How I love all of the very simple things in life.",
        "%s\n To me you are a work of art, and I would give you my heart - that's if I had one."
    ],
    notes = [
        "Nature is a language, can't you read?\n %s",
        "%s\n A symbol of where mad, mad lovers / must pause and draw the line.",
        '%s\n The pleasure, the privilege is mine.',
        '%s\n The more you ignore me, the closer I get.',
        '%s\n Behind the hatred there lies a murderous desire for love.',
        '%s\n In the days when you were hopelessly poor, I just liked you more.',
        '%s\n The strange logic in your clumsiest line / it stayed emblazoned on my mind.'
    ],
    laments = [
        "%s\n A frame of useless limbs / What can make good of the bad that's been done?",
        "%s\n Such a little thing, but the difference it made was grave.",
        '%s\n You shut your mouth, how can you say / I go about things the wrong way?',
        '%s\n Heaven knows, I\'m miserable now.',
        'Why do you come here when you know it makes things hard for me?\n %s',
        '%s\n Do you have a vacancy for a back-scrubber?',
        '%s\n Do you really think she\'ll pull through?',
        'I was delayed, I was waylaid.\n %s',
        "%s\n Through hail and snow I'd go, just to moon you.",
        '%s\n Ask me why and I\'ll spit in your eye.',
        'You have killed me.\n %s',
        '%s\n Last night I dreamt that somebody loved me. / No hope, no harm; just another false alarm'
    ],
    remark = function (collection) {
        function refresh() {
            return [].concat(collection);
        }
        var remarks = refresh();
        return function () {
            if (remarks.length === 0) remarks = refresh();
            return remarks.splice(Math.floor(Math.random() * remarks.length), 1)[0];
        };
    },
    admission = remark(admissions),
    whine = remark(laments.concat(notes)),
    note = remark(notes),
    lament = remark(laments),
    sayWithFeeling = function (feeling, strColor, feelingColor) {
        feelingColor = cliColor[feelingColor];
        strColor = cliColor[strColor];
        return function (str, nonsense) {
            // cli color end codes end ALL formatting, so they can't be nested. therefore we have to grab the original sentiment out of here to colorize it.
            if (nonsense === false) return util.puts(util.format("\n " + strColor(str)));
            var format = feeling(),
                sentiment = format.replace('%s','').trim();
            util.puts(util.format("\n " + format.replace(sentiment, feelingColor(sentiment)), strColor(str)));
        };
    };

module.exports = {
    admit: sayWithFeeling(admission, 'cyanBright', 'cyan'),
    whine: sayWithFeeling(whine, 'yellowBright', 'yellow'),
    note: sayWithFeeling(note, 'whiteBright', 'blackBright'),
    lament: sayWithFeeling(lament, 'redBright', 'red')
};