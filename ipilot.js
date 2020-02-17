const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const srcDir = process.argv[2];
const mediaDir = `${require('os').homedir()}/Library/Application Support/Anki2/User 1/collection.media`;

const loadCSV = (file) => {
    const content = fs.readFileSync(`${srcDir}/${file}.csv`, 'utf8');
    const data = parse(content, { delimiter: '|', columns: true });
    return data;
}
const tags = {
    10: 'Luftrecht',
    20: 'Luftfahrzeugkentnisse',
    30: 'Flugleistung/Flugplanung',
    40: 'Menschliches_Leistungsvermögen',
    50: 'Meteorologie',
    60: 'Navigation',
    70: 'Betriebsverfahren',
    80: 'Grundlagen_des_Fluges',
    90: 'Atmosphäre',
    100: 'Funknavigation',
    122: 'Kommunikation'
}

const questionData = loadCSV('question');
const answerData = loadCSV('answer');

const questions = Object.fromEntries(questionData.map(v => [v.code, v]));
answerData.forEach(v => {
    const question = questions[v.question];
    question.answers = [...question.answers || [], v];
});
Object.keys(questions).forEach(id => {
    const question = questions[id];
    question.solution = question.answers.findIndex(v => v.iscorrect === '1') + 1;
});

const formatAnswer = (answer) => {
    if (!answer) return '';
    return answer.name.replace(/\t/g, '').replace(/\\n/g, '<br />');
}

const formatQuestion = ({ code, name, answers, solution, referencecode, typecode }, tag) => {
    const image = typecode ? `${typecode.slice(0,-4)}.webp` : `${code}.webp`;
    const hasImage = fs.existsSync(`${mediaDir}/${image}`);
    return [
        code,
        name.replace(/\t/g, '').replace(/\\n/g, '<br />'),
        hasImage ? `<img src="${image}">` : '',
        formatAnswer(answers[0]),
        formatAnswer(answers[1]),
        formatAnswer(answers[2]),
        formatAnswer(answers[3]),
        solution,
        `${tag} ${referencecode}`
    ].join('\t')
}

const getCards = (category) => {
    const subject = category > 10 ? String(category) : `${category}0`;
    const tag = `${subject} ${tags[subject]}`;
    const out = Object.values(questions)
        .filter(v => v.category === String(category))
        .map(v => formatQuestion(v, tag));
    fs.writeFileSync(`out/${subject}.txt`, out.join('\n'));
};

[1,2,3,4,5,6,7,8,9,10,122].forEach(getCards);