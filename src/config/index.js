const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

function required(key) {
    const value = process.env[key]
    if (!value) {
        throw new Error(`Обязательная переменная окружения ${key} не задана`)
    }
    return value
}

function optional(key, defaultValue) {
    return process.env[key] || defaultValue
}

const config = {
    inputFile: required('INPUT_FILE'),
    outputFile: required('OUTPUT_FILE'),
    minAge: optional('MIN_AGE', 18),
    cityFilter: optional('CITY_FILTER', 'Москва'),
}

module.exports = config