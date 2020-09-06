// yarn ts a.ts lyr -t -y 1990
// import pdf from 'pdf-parse'
// import {fs} from 'fs'
import * as yargs from 'yargs'

const argv = yargs
    .command('lyr', 'Tells whether an year is leap year or not', {
        year: {
            description: 'the year to check for',
            alias: 'y',
            type: 'number',
        }
    })
    .option('time', {
        alias: 't',
        description: 'Tell the present Time',
        type: 'boolean',
    })
    .help()
    .alias('help', 'h')
    .argv;
console.log()

if (argv.time) {
    console.log('The current time is: ', new Date().toLocaleTimeString());
}

if (argv._.includes('lyr')) {
    const year:unknown|number = argv.year || new Date().getFullYear();
    console.log(typeof year)
    if (typeof year !== 'number') throw new Error('hoge')

    if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
        console.log(`${year} is a Leap Year`);
    } else {
        console.log(`${year} is NOT a Leap Year`);
    }
}

console.log(argv);

// const pdf_filename = '000017316.pdf'

// let dataBuffer = fs.readFileSync(pdf_filename);

// pdf(dataBuffer).then(function (data) {

//     // number of pages
//     console.log(data.numpages);
//     // number of rendered pages
//     console.log(data.numrender);
//     // PDF info
//     console.log(data.info);
//     // PDF metadata
//     console.log(data.metadata);
//     // PDF.js version
//     // check https://mozilla.github.io/pdf.js/getting_started/
//     console.log(data.version);
//     // PDF text
//     console.log(data.text);
// });