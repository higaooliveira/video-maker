
const readline = require('readline-sync')
const state = require('./state.js')

function robot() {
    const content = {
        maximumSentences: 7
    }
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    content.lang = 'pt'
    state.save(content)

    function askAndReturnSearchTerm() {
        return readline.question('Digite o termo de pesquisa: ')
    }

    function askAndReturnPrefix() {
        const prefixes = ['Quem é ?', 'O que é ?', 'A história de: ']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha uma opção: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]

        return selectedPrefixText
    }


}
module.exports = robot