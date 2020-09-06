import pdf = require('pdf-parse')
import * as fs from 'fs'
import puppeteer = require('puppeteer')
import clipboardy = require('clipboardy')
import { resolve } from 'path';
// import * as yargs from 'yargs'

let dataBuffer = fs.readFileSync('./Data_Science_for_Bus.pdf');

(async()=>{
    // 読み込み
    const data:{text:string} = await pdf(dataBuffer)

    // 改行区切りで[]に変換
    const texts:string[] = data.text.split('\n')

    // (111 | hogeとか、hoge | 222とかの行を消す)
    const ignore = []
    const ignorePageNumbers = texts.filter((text:string)=>{
        const regex = new RegExp(/^(\d{1,4} \| .+|.+ \| \d{1,4})$/)
        if (!regex.test(text)) {
            return text
        } else {
            ignore.push(text)
        }
    })

    // 指定した文字列が存在した場合、以降を除外する
    const ignoreAfter = []
    ignorePageNumbers.some((text:string)=>{
        const startIndex = "Aamodt, A., & Plaza, E. (1994). Case-based reasoning: Foundational issues, methodo‐"
        if (startIndex === text) return true
        ignoreAfter.push(text)
    })

    // ハイフンで終了した場合にハイフンを削除し、次の行とつなげる
    let flag = false
    let temp = []
    let result = []
    ignoreAfter.forEach((text)=>{
        const regex = new RegExp(/^.+(\-|\‐)$/)
        if (regex.test(text)){
            temp.push(text)
            flag = true
        } else if (flag) {
            flag = false
            const removedHyphen = temp.map((text:string)=>{
                return text.slice(0, -1)
            })
            removedHyphen.push(text)
            const joined = removedHyphen.join('')
            result.push(joined)
            temp = []
        } else {
            flag = false
            result.push(text)
        }
    })

    // 5000文字以下の[]にする
    const text = result.join(' ')
    const splited = text.split('.')
    const result2 = []
    let temp2 = ''
    splited.forEach((text)=>{
        if ((temp2 + text).length > 4999) {
            result2.push(temp2)
            temp2 = ''
        }
        temp2 = temp2 + '.' + text
    })
    if (temp2 !== '') result2.push(temp2)

    const browser = await puppeteer.launch({headless: false});
    const context = await browser.defaultBrowserContext()
    await context.overridePermissions('https://www.deepl.com/en/ja/translator', ['clipboard-read'])
    const page = await browser.newPage();
    await page.goto('https://www.deepl.com/en/ja/translator');

    for await (const text of result2) {

        await page.keyboard.down("ControlLeft");
        await page.keyboard.press("a");
        await page.keyboard.up("ControlLeft");

        await page.type('#dl_translator > div.lmt__sides_container > div.lmt__side_container.lmt__side_container--source > div.lmt__textarea_container > div > textarea', 'hoge')

        await page.click('#dl_translator > div.lmt__sides_container > div.lmt__side_container.lmt__side_container--source > div.lmt__textarea_container > div > textarea')

        await page.keyboard.down("ControlLeft");
        await page.keyboard.down("a");
        for await (const _ of new Array(30)) {
            await sleep(1000)
            try {
                await clipboardy.writeSync(text)
                break;
            } catch(e) {
                console.log(e)
            }
        }
        await page.keyboard.press("v");
        await page.keyboard.up("a");
        await page.keyboard.up("ControlLeft");

        const waitShowLoading =()=>{
            return new Promise((resolve, reject)=>{
                setTimeout(async()=>{
                    if (await page.$('.lmt__mobile_share_container.lmt__mobile_share_container--inactive') !== null) {
                        resolve('ok')
                    } else {
                        resolve('ko')
                    }
                }, 1000)
            })
        }

        for await (const _ of new Array(30)) {
            const ok = await waitShowLoading()
            if (ok === 'ok') break;
        }

        for await (const _ of new Array(60)) {
            const ko = await waitShowLoading()
            if (ko === 'ko') break;
        }

        await page.click('#dl_translator > div.lmt__sides_container > div.lmt__side_container.lmt__side_container--target > div.lmt__textarea_container > div.lmt__inner_textarea_container > textarea');

        await page.keyboard.down("ControlLeft");
        await page.keyboard.down("a");
        await page.keyboard.down("ControlLeft");
        await page.keyboard.down("c");

        const copiedText = await clipboardy.readSync()
        // const copiedText = await page.evaluate(`(async () => await navigator.clipboard.readText())()`)
        await write(copiedText + '\n')

        await page.keyboard.up("ControlLeft");
        await page.keyboard.up("c");
        await page.keyboard.up("ControlLeft");
        await page.keyboard.up("a");
        await sleep(3000)
    }

    await browser.close();

})()

// 書き出し
const write = async(text)=>{
    return new Promise((resolve)=>{
        fs.appendFile('a.txt', text, (err)=> {
            if (err) throw err
            resolve()
        })
    })
}

const sleep = async(n)=>{
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve()
        }, n)
    })
}