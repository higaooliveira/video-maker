const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')
const googleCredentials = require('../credentials/googleapi.json')

async function robot(){
    const content = state.load()

    await fetchImagesOfAllSentences(content)

    state.save(content)
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

}

module.exports = robot