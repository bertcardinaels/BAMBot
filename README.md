# QuoteBot
A Discord bot based on discord.js 

Gathers all quotes from `#quotes` channels  
Quote format: "text goes here" ~  
Single quotes and - accepted too  
`!help q` and `!qhelp` for more information

## Commands

```!quote search word @Mention```

Fetches a random quote
- Can be filtered on search words separated by spaces (OR filter)
- Can be filtered on mentions of users or roles (OR filter)
Aliases: `!q`

```!quotestats search word @Mention```

Shows stats on all gathered quotes
- Can be filtered on search words separated by spaces (OR filter)
- Can be filtered on mentions of users or roles (OR filter)
Aliases: `!qstat`, `!qstats`, `!quotestat`
