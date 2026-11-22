const config = require('./config')
const fs = require('fs')
const path = require('path')

const inputPath = process.env.INPUT_FILE
const outputPath = process.env.OUTPUT_FILE
const minAge = parseInt(process.env.MIN_AGE, 10)
const cityFilter = process.env.CITY_FILTER

function readWithStream(inputPath, callback) {
    const readable = fs.createReadStream(inputPath, {
        encoding: 'utf8',
        highWaterMark: 64 * 1024
    })

    let data = ''

    readable.on('data', (chunk) => {
        data += chunk.toString()
    })

    readable.on('error', (err) => {
        console.error('Ошибка чтения:', err.message)
        callback(err, null)
    })

    readable.on('end', () => {
        const lines = data.split('\n').map(line => line.trim()).filter(line => line)

        if (lines.length === 0) {
            callback(new Error('Файл пуст'), null)
            return
        }

        const header = lines[0]
        const rows = lines.slice(1)

        const filtered = rows.filter(line => {
            const parts = line.split(',')
            if (parts.length < 4) return false

            const [, , ageStr, city] = parts
            const age = parseInt(ageStr, 10)

            return age >= minAge && city === cityFilter
        })

        const result = [header, ...filtered].join('\n') + '\n'

        callback(null, {
            result,
            totalRows: rows.length,
            filteredRows: filtered.length
        })
    })
}

function writeWithStream(outputPath, resultData, callback) {
    const writable = fs.createWriteStream(outputPath)

    writable.write(resultData, 'utf8', (err) => {
        if (err) {
            console.error('Ошибка записи:', err.message)
            callback(err)
        } else {
            writable.end()
            callback(null)
        }
    })

    writable.on('error', (err) => {
        console.error('Ошибка записи:', err.message)
        callback(err)
    })
}

function processFile(inputPath, outputPath) {
    readWithStream(inputPath, (err, data) => {
        if (err) {
            console.error('Ошибка обработки:', err.message)
            process.exit(1)
        }

        writeWithStream(outputPath, data.result, (err) => {
            if (err) {
                console.error('Ошибка записи:', err.message)
                process.exit(1)
            }

            console.log('Файл обработан')
            console.log(`Всего строк обработано: ${data.totalRows}`)
            console.log(`Строк прошло фильтр: ${data.filteredRows}`)
        })
    })
}

const outputDir = path.dirname(outputPath)
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
}

fs.writeFileSync(outputPath, '')
console.log(`Создан файл: ${outputPath}`)

processFile(inputPath, outputPath)