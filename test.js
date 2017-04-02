var fs = require('fs');

var obj = JSON.parse(fs.readFileSync('./strofe.json', 'utf8'));
var arr = [];
for (var i=0; i<obj.length; i++) {
    arr.push(obj[i].strofa);
}

var frase = "prova fiore annegare";

frase = frase.split(' ').filter(function ( frase ) {
    var word = frase.match(/(\w+)/);
    return word && word[0].length > 3;
}).join( ' ' );

console.log(frase);


var test = frase.split( ' ' );
var filtered = arr.filter(cond);

function cond(item) {
    for (var i = 0; i<test.length; i++) {
        //RegExp('\\b'+ word +'\\b').test(str)
        var myPattern = new RegExp('\\b'+ test[i] +'\\b','gi'); // ho aggiunto gli spazi
        //console.log(test[i])
        var matches = item.match(myPattern);
        
        if (matches !== null) {
            console.log("..." + matches)
            return true;
        }
            
    }
}

console.log(filtered);

