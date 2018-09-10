/**
 * Batch translate key-value pairs from JSON file
 * using the Google Cloud Translation API.
 * Since the Translation API does not support regions,
 * that support is added with a local dictionary for
 * Great Britain.
 */
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
    t: locale
  },
})

args.d = args.d.replace(/[ \/]+$/, '')

function getTargetLocale() {
  return args.t.replace(/[-_](..)$/, s => {
    return s.toUpperCase()
  })
}

function getTargetFilename(file) {
  const targetLocale = getTargetLocale()
  let targetFile = file
  let sourceLocale = args.f

  targetFile = targetFile.replace(sourceLocale, targetLocale)
  sourceLocale = sourceLocale.replace('-', '_')
  targetFile = targetFile.replace(sourceLocale, targetLocale)

  if (/^(.(?!\.js$))+$/i.test(targetFile)) {
    targetFile += '.js'
  }

  return targetFile
}

function writeTranslations(locale, map, file, mutator = () => {}) {
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
  mutator(map, key)
  data += '  ' + key + ': \'' + map[key].replace(/'/g, '\\\'') + '\'' + os.EOL
  data += '}' + os.EOL

  fs.writeFileSync(args.d + '/' + getTargetFilename(file), data)
  console.log('Translation ' + locale + ' completed.')
}

function processMapGB(map, file) {
  const enDict = require(__dirname + '/data/wordmap_enus_to_enuk.js').wordmap_enUS_to_enGB
  const locale = getTargetLocale()
  writeTranslations(locale, map, file, (map, key) => {
    map[key] = map[key].replace(/\b\w+\b/g, w => { return enDict[w] || w })
  })
}

function processMapGoogleTranslate(map, file) {
  const promises = []
  const body = {
    target: args.t.replace(/[-_](..)$/, '').toLowerCase(),
    format: 'text'
  }
  if (args.f && args.f.length > 1) {
    body.source = args.f.replace(/[-_](..)$/, '').toLowerCase()
  }

  // tweaks below for Japanese translation
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

  q.all(promises).then(() => {
    writeTranslations(body.target, map, file)
  })
}

function processMap(map, file) {
  if (/en[-_](gb|uk)$/i.test(args.t)) {
    processMapGB(map, file)
  } else {
    processMapGoogleTranslate(map, file)
  }
}

function processFiles() {

  for (let file of args._) {
    file = file.replace(/^[^.\/].+/, './' + file)

    let localeKey = require(file)
    for (let key in localeKey) {
      processMap(localeKey[key], file)
    }
  }
}

processFiles()

