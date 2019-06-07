const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')
const watsonApiKey = require('../credentials/watsonnlu.json').apikey
const state = require('./state.js')
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')

const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

async function robot() {
    const content = state.load()
    await fetchContentFromWeb(content)
    await sanitizeContent(content)
    await breakContentIntoSentences(content)
    await limitMaximumSentences(content)
    await fecthKeywordsOfAllSentences(content)
    state.save(content)
    async function fetchContentFromWeb(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const fetchAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const response = await fetchAlgorithm.pipe(content.searchTerm)
        const responseContent = response.get()

        content.sourceContentOriginal = responseContent.content
    }


    async function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = await removeBlankLinesAndMarkDown(content.sourceContentOriginal)
        const withoutDatesInParentheses = await removeDatesInParentheses(withoutBlankLinesAndMarkdown)
        content.sourceContentSanitized = withoutDatesInParentheses
        async function removeBlankLinesAndMarkDown(text) {
            const allLines = text.split('\n')
            const withoutBlankLinesAndMarkdown = allLines.filter(line => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }

        async function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/   /g, ' ')
        }
    }


    async function breakContentIntoSentences(content) {
        content.sentences = []
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach(sentence => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

    function limitMaximumSentences(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fecthKeywordsOfAllSentences(content) {
        for (const sentence of content.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }
    }
    async function fetchWatsonAndReturnKeywords(sentence) {

        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    throw error;
                }

                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })
                resolve(keywords)
            })
        })

    }

}

module.exports = robot