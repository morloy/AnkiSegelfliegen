const { parse } = require('fast-xml-parser');
const fs = require('fs');

const xmlFile = process.argv[2];
const mediaDir = `${require('os').homedir()}/Library/Application Support/Anki2/User 1/collection.media`;

const xml = fs.readFileSync(xmlFile, 'utf8');
const data = parse(xml, { ignoreAttributes: false, attributeNamePrefix: '' });

const tags = {
    10: 'Luftrecht',
    20: 'Luftfahrzeugkentnisse',
    30: 'Flugleistung/Flugplanung',
    40: 'Menschliches_Leistungsvermögen',
    50: 'Meteorologie',
    60: 'Navigation',
    70: 'Betriebsverfahren',
    80: 'Grundlagen_des_Fluges',
    90: 'Kommunikation' 
}


const getQuestion = ({ question, answer, id, chapter }) => {
    const image = `p${id}.png`;
    const hasImage = fs.existsSync(`${mediaDir}/${image}`);
    return ({
        id: `stp:${id}`,
        question,
        image: hasImage ? `<img src="${image}">` : '',
        answer1: answer[0].text,
        answer2: answer[1].text,
        answer3: answer[2].text,
        answer4: answer[3].text,
        solution: answer.findIndex(v => v.isCorrect === 'TRUE') + 1,
        tags: `${chapter} ${tags[chapter]}`
    });
}
const questions = data.qdata.problem.map(getQuestion);

Object.keys(tags).forEach(chapter => {
    const out = questions
        .filter(v => v.tags.startsWith(chapter))
        .map(v => Object.values(v).join('\t')).join('\n');
    fs.writeFileSync(`out/${chapter}.txt`, out);
})
