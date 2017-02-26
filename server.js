var express = require('express');
var path = require("path");
var helmet = require("helmet");

var app = express();
app.use(helmet());


app.get("/", function(request, response){
  response.sendFile(path.join(__dirname, "public", "index.html"));
});


function parseDateFromUrlPath(urlPath){
    var pathWithoutInitialSlash = decodeURIComponent(urlPath.slice(1));
    return Date.parse(pathWithoutInitialSlash);
}

//Parse text date
var regexForPathWithNonDigits = /\/[^-].*\D/;

app.get("/*", function(request, response, next){
  next();
});

app.get(regexForPathWithNonDigits, function(request, response, next){
    var unixdate = parseDateFromUrlPath(request.path) / 1000;
    response.locals.unixdate = unixdate;
    next();
});


//Parse unixdate
var regexJustDigits = /\/-?\d*$/;

app.get(regexJustDigits, function(request, response, next){
    var unixdate = request.path.slice(1);
    response.locals.unixdate = unixdate;
    next();
});

var naturalDateOptions = {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        };

//Send response
app.get("/*", function(request, response){
    var returnMessage = {unix: null, natural: null};
    if(!isNaN(response.locals.unixdate)){
        returnMessage.unix = response.locals.unixdate;
        returnMessage.natural = new Date(response.locals.unixdate*1000)
                                        .toLocaleDateString("en", naturalDateOptions);
    }
    response.send(returnMessage);
});

app.listen(process.env.PORT || 8080);
