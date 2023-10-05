import * as https from 'https'
import * as fs from 'fs'
import chalk from 'chalk'

function fetchEasyList() {
  const easyListURL = 'https://easylist.to/easylist/easylist.txt'
  return new Promise<string>((resolve, reject) => {
    https.get(easyListURL, (response) => {
      let data = ''
      response.on('data', (chunk) => {
        data += chunk
      })
      response.on('end', () => resolve(data))
      response.on('error', (err) => reject(err))
    })
  })
}

const isIdSelector = (s: string) => s.startsWith('#')
const isClassSelector = (s: string) => s.startsWith('.')
const isSimpleAttributeSelector = (s: string) => {
  return s.startsWith('[') && s.endsWith(']')
}
const isComplexAttributeSelector = (s: string) => {
  return s.includes('[') && s.includes(']')
}
const isOtherSelector = (s: string) => {
  return (
    !isIdSelector(s) &&
    !isClassSelector(s) &&
    !isSimpleAttributeSelector(s) &&
    !isComplexAttributeSelector(s)
  )
}

const extractIdOrClassSelector = (s: string) => s.substring(1)

const getEasyListCssSelectors = async () => {
  const data = await fetchEasyList()

  // Splitting the list by lines
  const lines = data.split('\n')

  // Filtering out only CSS rules which would be like: ##.adClass or ##[href*="ads.com"]
  // This doesn't account for all possible scenarios but should cover a good chunk of them
  const cssRules = lines.filter((line) => line.startsWith('##'))

  // Extracting selectors from those rules
  const selectors = cssRules.map((rule) => rule.substring(2))

  const idSelectors = selectors
    .filter(isIdSelector)
    .map(extractIdOrClassSelector)
  const classSelectors = selectors
    .filter(isClassSelector)
    .map(extractIdOrClassSelector)
  //TODO: implement parsing of attribute selectors
  const simpleAttributeSelectors = selectors.filter(isSimpleAttributeSelector)
  const complexAttributeSelectors = selectors.filter(isComplexAttributeSelector)
  const elementSelectors = selectors.filter(isOtherSelector)

  return {
    idSelectors,
    classSelectors,
    simpleAttributeSelectors,
    complexAttributeSelectors,
    elementSelectors,
  }
}

getEasyListCssSelectors()
  .then((selectors) => {
    console.log('Id selectors: ', selectors.idSelectors)
    console.log('Class selectors: ', selectors.classSelectors)

    const json = JSON.stringify({
      id: selectors.idSelectors,
      class: selectors.classSelectors,
    })

    fs.writeFile(
      __dirname + '/easylist-css-selectors.json',
      json,
      'utf8',
      function (err) {
        if (err) {
          console.error(chalk.red(err))
          process.exit(1)
        } else {
          console.log(chalk.green('Easylist CSS selectors written to file!'))
        }
      }
    )

    // console.log('Attribute selectors: ', selectors.simpleAttributeSelectors)
    // console.log('A href selectors: ', selectors.complexAttributeSelectors)
    // console.log('Other selectors: ', selectors.elementSelectors)
  })
  .catch((error) => {
    console.error('Error fetching or parsing EasyList:', error)
  })
