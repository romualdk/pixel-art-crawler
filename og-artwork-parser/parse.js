const fs = require('fs')
const fetch = require('node-fetch')
const FileType = require('file-type')
const gifyParse = require('gify-parse')

const inputDirectory = 'input'
const outputDirectory = 'output'

fs.readdir(inputDirectory, function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err)
  }

  files.forEach(function (file) {
    parseFile(file)
  })
})

function parseFile (file) {
  const data = JSON.parse(fs.readFileSync(inputDirectory + '/' + file))

}

downloadFile('http://pixeljoint.com/files/icons/full/px_lizzard_warrior32.gif', 'run.gif')

async function downloadFile (url, path) {
  const resp = await fetch(url)
  const type = await FileType.fromStream(resp.body)

  console.log(type)

  if (type.mime === 'image/gif') {
    const buffer = fs.readFileSync('run.gif')
    const gif = gifyParse.getInfo(buffer)

    console.log(gif)
  }
}
