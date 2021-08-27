# QuoteBot
A Discord bot based on discord.js 

Gathers all quotes from `#quotes` channels  
Quote format: `"text goes here" ~ `  
Single quotes `'` and `-` accepted too  
`!qhelp` or `!help <command>` for more information

## Commands

```
!quote
```
Fetches a random quote  
Aliases: `!q`  
Slash command: `/quote`

```
!quotestats
```
Shows stats on all gathered quotes  
Aliases: `!qstat`, `!qstats`, `!quotestat`  
Slash command: `/quotestats`

### Filtering
Both commands can be filtered as follows:
1. `!q laugh joke` Quotes which include laugh or joke somewhere in the quote
2. `!q "set of words"` Quotes which include the set of words, single `'` works
3. `!q @Mention` Quotes which include the mentioned user or role

Combining text filters (`1` or `2`) with mention filters (`3`) returns quotes which satisfy both kinds of filters.