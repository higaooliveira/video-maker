const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')
async function robot(content){
    await fetchContentFromWeb(content)
    await sanitizeContent(content)
    await breakContentIntoSentences(content)


    async function fetchContentFromWeb(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const fetchAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const response = await fetchAlgorithm.pipe(content.searchTerm)
        const responseContent = response.get()

        content.sourceContentOriginal = responseContent.content
    }


    async function sanitizeContent(content){
        const withoutBlankLinesAndMarkdown = await removeBlankLinesAndMarkDown(content.sourceContentOriginal)
        const withoutDatesInParentheses = await removeDatesInParentheses(withoutBlankLinesAndMarkdown)
        content.sourceContentSanitized = withoutDatesInParentheses
        async function removeBlankLinesAndMarkDown(text){
            const allLines = text.split('\n')
            const withoutBlankLinesAndMarkdown = allLines.filter(line => {
                if(line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }
                return true
            })
            
            return withoutBlankLinesAndMarkdown.join(' ')
        }

        async function removeDatesInParentheses(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/   /g, ' ')
        }
    }


    async function breakContentIntoSentences(content){
        content.sentences = []
        const sentences =  sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach(sentence => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
    
}

module.exports = robot;