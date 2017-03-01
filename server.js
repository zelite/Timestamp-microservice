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

var UNIXDATE_MIN_VALUE = new Date(-8640000000000);
var UNIXDATE_MAX_VALUE = new Date(8640000000000);

function validateUnixDate(unixdate){
  if(unixdate >= UNIXDATE_MIN_VALUE & unixdate <= UNIXDATE_MAX_VALUE){
    return unixdate;
  }else{
    return null;
  }
}

app.get(regexJustDigits, function(request, response, next){
    var unixdate = validateUnixDate(request.path.slice(1));
    response.locals.unixdate = unixdate;
    next();
});

var naturalDateOptions = {
                            month: 'long',
                            day: 'numeric'
                        };

function convertUnixdateToNaturalLanguage(unixdate){
  var date = new Date(unixdate*1000);
  return date.toLocaleDateString("en", naturalDateOptions)+", "+date.getFullYear();
}


//Send response
app.get("/*", function(request, response){
    var returnMessage = {unix: null, natural: null};
    if(!isNaN(response.locals.unixdate)){
        returnMessage.unix = response.locals.unixdate;
        if(returnMessage.unix){
          returnMessage.natural = convertUnixdateToNaturalLanguage(response.locals.unixdate);
        }
    }
    response.send(returnMessage);
});

app.listen(process.env.PORT || 8080);
