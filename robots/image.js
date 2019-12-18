const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')
const googleCredentials = require('../credentials/googleapi.json')
const imageDownloader = require('image-downloader')


async function robot(){
    const content = state.load()

    // await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)

    // state.save(content)

    async function fetchImagesOfAllSentences(content){
        for (const sentence of content.sentences){
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagesLink(query)
            sentence.googleQuery = query
        }
    }
    
    async function fetchGoogleAndReturnImagesLink(query){
        const response = await customSearch.cse.list({
            auth: googleCredentials.apiKey,
            cx: googleCredentials.searchEngineId,
            q: query,
            searchType: 'image',
            num: 2
        })

        const imagesUrl = response.data.items.map((item) => item.link)
        return imagesUrl
    }

    async function downloadAllImages(content){
        content.downloadedImages = []
        content.sentences[1].images[0] = 'https://liquipedia.net/commons/images/thumb/0/04/SKGaming.png/600px-SKGaming.png'

        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            const images = content.sentences[sentenceIndex].images
            for(let imageIndex = 0; imageIndex < images.length; imageIndex++){
                const imageUrl = images[imageIndex]

                try{
                    if(content.downloadedImages.includes(imageUrl)){
                        throw new Error('Imagem já baixada')
                    }
                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
                    content.downloadedImages.push(imageUrl)
                    console.log(`> [${sentenceIndex}]|[${imageIndex}] Baixou imagem com sucesso (${imageUrl})`)
                    break
                }catch(error){
                    console.log(`> [${sentenceIndex}]|[${imageIndex}] Erro ao baixar (${imageUrl}): ${error}`)
                }
            }
        }
    }

    async function downloadAndSave(imageUrl, fileName){
        return imageDownloader.image({
            url: imageUrl,
            dest: `./content/${fileName}`
        })
    }
}

module.exports = robot