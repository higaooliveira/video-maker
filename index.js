const readline = require('readline-sync')
function start (){
    const content = {}
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    
    function askAndReturnSearchTerm(){
        return readline.question('Digite o termo de pesquisa: ')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Quem é ?', 'O que é ?', 'A história de: ']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha uma opção: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]

        return selectedPrefixText
    }
    console.log(content)
}

start();