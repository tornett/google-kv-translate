/**
 * Batch translate
 *
 */
const enDict = require('./data/wordmap_enus_to_enuk.js').wordmap_enUS_to_enGB
const fs = require('fs')
const locale = require('os-locale').sync()
const minimist = require('minimist')
const os = require('os')
const q = require('q')
const {Translate} = require('@google-cloud/translate')

const translate = new Translate()

const args = minimist(process.argv.slice(2), {
  default: {
    d: '.',
    f: null,
    t: locale,
    k: process.env.TRANSLATE_KEY
  },
})

args.d = args.d.replace(/[ \/]+$/, '')

function writeTranslations(locale, map, mutator = () => {}) {
  let sep = '\''
  let data = 'exports.' + locale + ' = {' + os.EOL
  let objs = Object.entries(map)

  if (!fs.existsSync(args.d)) {
    fs.mkdirSync(args.d);
  }

  for (let i = 0; i < objs.length - 1; i++) {
    let key = objs[i][0]
    if (/\r|\n/.test(map[key])) {
      sep = '`'
    } else {
      sep = '\''
    }

    mutator(map, key)

    data += '  ' + key + ': ' + sep + map[key].replace(/'/g, '\\\'') + sep + ',' + os.EOL
  }
  let key = objs[objs.length - 1][0]
  data += '  ' + key + ': \'' + map[key].replace(/'/g, '\\\'') + '\'' + os.EOL
  data += '}' + os.EOL

  fs.writeFileSync(args.d + '/text_' + locale + '.js', data)
  console.log('Translation ' + locale + ' completed.')
}

function writeAllTranslations() {
  writeTranslations('jp', jp)
  writeTranslations('en', en, (map, key) => {
    map[key] = map[key].replace(/\b\w+\b/g, w => { return enDict[w] || w })
  })
}

function processMap(map) {
  const promises = []
  const body = {
    target: args.t.replace(/[-_](..)$/, '').toLowerCase(),
    format: 'text'
  }
  if (args.f && args.f.length > 1) {
    body.source = args.f.replace(/[-_](..)$/, '').toLowerCase()
  }
  Object.entries(map).forEach(function (data) {
    body.q = data[1].replace(/[pP]lanner/g, 'plan')
    let promise = translate.translate(body.q, body.target).then(results => {
      const translation = results[0]
      if (translation) {
        if (translation === '[OK]') {
          translation = 'OK'
        }
        map[data[0]] = translation
      }
    }).catch(err => {
      console.error(err)
      process.exit(1)
    })
    promises.push(promise)
  })

  q.all(promises).then(() => { writeTranslations(body.target, map) })
}

function processFiles() {

  for (let file of args._) {
    file = file.replace(/^[^.\/].+/, './' + file)

    let localeKey = require(file)
    for (let key in localeKey) {
      processMap(localeKey[key])
    }
  }
}

processFiles()

