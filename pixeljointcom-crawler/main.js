const Apify = require('apify')
const fs = require('fs')

const {
  utils: { enqueueLinks }
} = Apify

const domain = 'http://pixeljoint.com'
const newArt = 'http://pixeljoint.com/pixels/new_icons.asp?ob=date'

const directory = 'apify_storage/datasets/pixeljointcom-artworks'

fs.rmdirSync(directory, { recursive: true })
fs.mkdirSync(directory)

Apify.main(async () => {
  const source = newArt

  const requestQueue = await Apify.openRequestQueue()
  await requestQueue.addRequest({ url: source })

  const handlePageFunction = async ({ request, $ }) => {
    console.log(`Processing ${request.url}`)

    if (request.userData.detailPage) {
      const rows = $('h1').filter(function () {
        return $(this).text().trim() === 'Pixel Art Details'
      }).parent().find('.bx td strong')

      const title = $(rows).filter(function () {
        return $(this).text().trim() === 'Title:'
      }).parent().next().text().trim()

      const author = $(rows).filter(function () {
        return $(this).text().trim() === 'Pixel Artist:'
      }).parent().next().find('a').text().trim()

      const posted = $(rows).filter(function () {
        return $(this).text().trim() === 'Posted:'
      }).parent().next().text().trim()

      const image = domain + $('.img-holder img').attr('src')

      const date = new Date(posted).toISOString()

      const strip = (str) => { return str.replace(/[^0-9a-z]/gi, '').trim() }

      const id = [
        'pixeljointcom',
        strip(date.split('T')[0] + 'T' + date.split('T')[1].substring(0, 5)),
        strip(author).toLowerCase(),
        strip(title).toLowerCase()
      ].join('-').substring(0, 128)

      const results = {
        url: request.url,
        type: 'pixelart:artwork',
        image: image,
        title: title,
        created: date,
        creator: author,
        site_name: 'Pixel Joint'
      }

      let data = JSON.stringify(results)
      fs.writeFileSync(directory + '/' + id + '.ogp.json', data)
    }

    if (!request.userData.detailPage) {
      await Apify.utils.enqueueLinks({
        $,
        requestQueue,
        selector: 'a.imglink',
        baseUrl: request.loadedUrl,
        transformRequestFunction: req => {
          req.userData.detailPage = true
          return req
        }
      })

      await Apify.utils.enqueueLinks({
        $,
        requestQueue,
        selector: '.pager a',
        baseUrl: request.loadedUrl
      })
    }
  }

  const crawler = new Apify.CheerioCrawler({
    requestQueue,
    handlePageFunction
  })

  await crawler.run()
})
