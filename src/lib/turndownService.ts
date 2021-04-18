import TurndownService from 'turndown'

const turndownOptions: TurndownService.Options = {
  headingStyle: 'atx',
  bulletListMarker: '*',
}
const turndownFilter: TurndownService.Filter = ['script']
const turndownService = new TurndownService(turndownOptions)
turndownService.remove(turndownFilter)

export { turndownService }
