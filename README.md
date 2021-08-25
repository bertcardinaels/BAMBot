# QuoteBot
A Discord bot based on discord.js 

Gathers all quotes from `#quotes` channels  
Quote format: `"text goes here" ~ `  
Single quotes `'` and `-` accepted too  
`!help q` and `!qhelp` for more information

## Commands

```
!quote
```
Fetches a random quote
Aliases: `!q`

```
!quotestats
```
Shows stats on all gathered quotes  
Aliases: `!qstat`, `!qstats`, `!quotestat`

###
Both commands can be filtered as follows:
1. `!q laugh joke`: Quotes which include laugh or joke somewhere in the quote
2. `!q "Strict sentence"`: Quotes which include the sentence part
3. `!q @Mention`: Quotes which include the mentioned user or role

Combining text (`1` or `2`) with mention (`3`) returns quotes which satisfy both criteria