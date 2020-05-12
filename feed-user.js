
var fs = require('fs');
var mkdirp = require('mkdirp');
var ureq = require('unirest');
var Parser = require('rss-parser');
var parser = new Parser();

var feedu = module.exports;


/**
 * Parse RSS content into an array with items containing :
 *        - title,
 *        - lastBuildDate,
 *        - description,
 *        - link
 *
 * @param url      - url that needs to be parsed to JSON
 * @param callback  - callback with feed's items array
 *
 */

feedu.fetchRSS = async (url, callback) => {

    /**
     * Array used to contain all asynchronous feed elements while sending and gathering new ones
     */
    let _buff = [];

    new Promise((resolve, reject) => {
        parser.parseURL(url, (err, feed) => {
            if (this.identify === "atom")
                reject(new Error("Atom links cannot be handled yet, they will be availabale in next versions"));
            if (feed === undefined)
                reject(new Error("Incorrect RSS link, check your URL/connection"));
            else if (err)
                reject("Promise rejection warning : Parsing failed // parser.parseURL()");
            else {

                for (let i = 0; i < feed.items.length; i++) 
                    _buff.push(feed.items[i]);
                
                
                if (feed.link)          _buff.link          = feed.link;
                if (feed.title)         _buff.title         = feed.title;
                if (feed.description)   _buff.description   = feed.description;
                if (feed.lastBuildDate) _buff.lastBuildDate = feed.lastBuildDate;

                if (feed.image && feed.image[0] && feed.image[0].url) {
                    _buff.image = {};
                    let image = feed.image[0];
                    if (image.link)     _buff.image.link        = image.link[0];
                    if (image.url)      _buff.image.url         = image.url[0];
                    if (image.title)    _buff.image.title       = image.title[0];
                    if (image.width)    _buff.image.width       = image.width[0];
                    if (image.height)   _buff.image.height      = image.height[0];
                }
                resolve(_buff);
            }
        });
    })
    .catch((err) => {
        throw new Error(err);
    })
    .then(() => {
        callback(_buff);
    });
};



/**
 * INTERNAL function
 * 
 * Uses RegEx to identify if the provided URL is a RSS or ATOM link
 * 
 * @param xml   - XML input, a RSS/ATOM link
 * @return      - Returns if it is RSS or ATOM link. Or false if none.
 */
feedu.identify = (xml) => {
    if (/<(rss|rdf)\b/i.test(xml)) {
        return "rss";
    } else if (/<feed\b/i.test(xml)) {
        return "atom";
    } else {
        return false;
    }
};

/**
 * PUBLIC function
 * 
 * Appends feed to a JSON file with 
 *      {
 *        title,
 *        lastBuildDate,
 *        description,
 *        link,
 *        items[],
 *        image[]
 *      }
 * If you have more than 100MB on your JSON file, you should use a database.
 * 
 * @param array         - Array to convert to JSON
 * @param path          - Path of the JSON file (if there in none, one will be created)
 * 
 * @callback            - Any callback function will receive the JSON file
 * 
 */
feedu.feedAppendJSON = (array, path) => {
    /**
     * Empty object with items and infos arrays so it is considered as a JSON object
     */
    let _jbuff = {
        "items": [],
        "infos": []
    };
    if (array === undefined) throw new Error("Array or feed is undefined");
    if (!fs.existsSync(path)) {
        this.feedOverwriteJSON(array, path, false);
        return;
    } 

    else {
        try {
             this.feedOverwriteJSON(array, path, false);
        } catch (error) { throw err; }
    }
    
    array.forEach(elem => {
        if (elem instanceof Array)
            array.forEach( elem => {
                _jbuff.items.push(elem);
            });
        _jbuff.items.push(elem);
    });

    if (array.title)
        _jbuff.infos.push({ "title": array.title });
    if (array.link)
        _jbuff.infos.push({ "link": array.link });
    if (array.description)
        _jbuff.infos.push({ "description": array.description });
    if (array.lastBuildDate)
        _jbuff.infos.push({ "lastBuildDate": array.lastBuildDate });

    fs.writeFileSync(path, JSON.stringify(_jbuff), 'utf8');
    console.log(_jbuff);
        

};

/**
 * PUBLIC function
 * 
 * Overwrites JSON file with last feed
 *      {
 *        title,
 *        lastBuildDate,
 *        description,
 *        link,
 *        items[],
 *        image[]
 *      }
 * If you have more than 100MB on your JSON file, you should use a database.
 * 
 * @param array         - Array to convert to JSON
 * @param path          - Path of the JSON file (if there in none, one will be created)
 * @param opt           - (boolean): Name your JSON as today's date (true if not empty)
 * 
 * @callback            - Any callback function will receive the JSON file
 * 
 */
feedu.feedOverwriteJSON = (array, path, opt) => {

    /**
     * Checks if the opt parameter is enabled (enable if not empty)
     */
    var option = opt !== undefined ? true : false;

    /**
     * Creates a filename at today's date : May_04_2020.json (example)
     */
    var timestamp = new Date().toString().split(' ');
    timestampString = timestamp[1] + "_" + timestamp[2] + "_" + timestamp[3] + ".json";

    /**
    * Empty object with items and infos arrays so it is considered as a JSON object
    */
    let _jbuff = {
            "items": [],
            "infos": []
        };

    if (array === undefined) throw new Error("Array or feed is undefined");  

    array.forEach(elem => {
        if (elem instanceof Array)
            array.forEach(elem => {
                _jbuff.items.push(elem);
            });
        _jbuff.items.push(elem);
    });

    if (array.title)
        _jbuff.infos.push({ "title": array.title });
    if (array.link)
        _jbuff.infos.push({ "link": array.link });
    if (array.description)
        _jbuff.infos.push({ "description": array.description });
    if (array.lastBuildDate)
        _jbuff.infos.push({ "lastBuildDate": array.lastBuildDate });
    
    if(option) {

        let _path = path.split('/');
        if (!fs.existsSync(path)) this.createPath(path);
        path.replace(_path.length - 1 , timestampString);
        
        fs.writeFileSync(path, JSON.stringify(_jbuff));
    } else
        fs.writeFileSync(path, JSON.stringify(_jbuff), 'utf8');
};

/**
 * PUBLIC function
 *
 * Creates needed folders to reach an unexisting path.
 * 
 * @param path - Path to the JSON file (if there in none, one will be created)
 *
 */

feedu.createPath = (path) => {

    _path = path.split('/');

    if (!fs.existsSync(_path)) {
        let part = '.';
        for (let i = 1; i < _path.length; i++) {
            if (process.platform === "win32")
                part += "\\" + _path[i];
            else
                part += "/" + _path[i];
            console.log("Created folder : " + __dirname + part);
            if (!fs.existsSync(part)) {
                mkdirp(part);
            }
        }
    }
};


/**
 * FOR EXPERIMENTAL USE (Public function)
 * 
 * Have a bug with Unirest module `Can't find module named 'unirest'`
 * Useful when creating an application that needs to load HTML pages
 * 
 * @param link - Link of the article you want to get.
 * @returns      The requested article HTML page
 * 
 */

feedu.getArticle = (link) => {

    ureq
        .post(link)
        .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
        .then((response) => {
            return response.body;
        });
};