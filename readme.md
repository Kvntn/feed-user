# Introduction

This package has for objective to help RSS feeds' users to handle them.
Atom links are not handled yet.

BE CAREFUL !! This project was made within a school project. Maintainance may not be punctual.

## Installation

```bash
npm install feed-user
```

## Usage

```javascript
var feedu = require('feed-user');

var urls = [
    "https://stackoverflow.com/feeds",
    "http://feeds.bbci.co.uk/news/rss.xml"
];

urls.forEach(url => {
    //Main function
    feedu.fetchRSS(url, (feed) => {
        for (let i = 0; i < feed.length; i++) {
            console.log(feed[i].title, feed[i].link);
        }
        var itemsArray = feed;
    })
    //Overwrite a JSON file
    .feedOverwriteJSON(itemsArray, PATH_TO_FILE, enableTodaysDateNaming)
    //or append to an existing one !
    .feedAppendJSON(itemsArray, PATH_TO_FILE);
});

//Gathers html file from link (experimental)
feedu.getArticle(itemsArray[3].link);
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

BE AWARE : I am not an expert, still studying toughly, and stay in love of Node.js.
This may not be the quality you expected. I apologize for all disagreements.

## License

[MIT](https://choosealicense.com/licenses/mit/)