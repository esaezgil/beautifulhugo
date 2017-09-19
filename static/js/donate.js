// donate-bitcoin Copyright (GPL) 2016  Nathan Robinson

var address = "3KLWgFp8ExohW8Gw9ZLPasdgUwRKHFv3rX";
// The bitcoin address to receive donations. Change to yours
var popup = false;
// Set to true if you want a popup to pay bitcoin
var currency_code = "EUR";
// Change to your default currency. Choose from https://api.bitcoinaverage.com/ticker/
var qrcodeOption = true;
// Set to false to disable qrcode
var link = true;
// Set to false to disable generating hyperlink
var mbits = false;
// Set to false to display bitcoin traditionally
var params = {};
// Aux var for signalling not supported currency
var unsupportedCurrency = false;

if (location.search) {
    var parts = location.search.substring(1).split('&');
    for (var i = 0; i < parts.length; i++) {
        var nv = parts[i].split('=');
        if (!nv[0])
            continue;
        params[nv[0]] = nv[1] || true;
    }
}

if (params.currency) {
    currency_code = params.currency;
}
;if (params.mbits == "true") {
    mbits = true
}
;if (params.mbits == "false") {
    mbits = false
};

function donate() {
    $.getJSON("https://blockchain.info/ticker?cors=true", function(currencyExchangeResponse) {
        composeAndDrawDonationElements(currencyExchangeResponse);
        setCurrencyButton();
    });
}

function getBitcoinPrice(currencyExchangeResponse, currency_code) {
    try {
        return currencyExchangeResponse[currency_code]['buy'];
    } catch (err) {
        alert('Could not find the requested currency, will be using Euros instead');
        unsupportedCurrency = true;
        return currencyExchangeResponse.EUR.buy;
    }
}

function composeAndDrawDonationElements(currencyExchangeResponse) {
    var currency_value = parseFloat(document.getElementById("donatebox").value);

    console.log(currencyExchangeResponse);

    if (isNaN(currency_value) == true && isNaN(params.amount) == true) {
        currency_value = 5;
    } else if (isNaN(currency_value) && isNaN(params.amount) == false) {
        currency_value = params.amount;
    }
    bitcoin_price = getBitcoinPrice(currencyExchangeResponse, currency_code);
    var finalexchange = (currency_value / bitcoin_price).toFixed(5);
    var url = "bitcoin:" + address + "?amount=" + finalexchange;
    if (unsupportedCurrency == true) {
        currency_code = 'EUR';
    }
    if (mbits == true) {
        var mbitprice = (finalexchange * 1000).toFixed(2);
        var donatedisplay = mbitprice.toString() + " mBits" + " (" + currency_value + " " + currency_code + ") " + "to ";
    }
    if (mbits == false) {
        var donatedisplay = finalexchange.toString() + " Bitcoin" + " (" + currency_value + " " + currency_code + ") " + "to ";
    }
    if (link == true) {
        document.getElementById("donatetext").innerHTML = "<br><a href='" + url + "'> Please send " + donatedisplay + address + "</a>";
    }
    if (qrcodeOption == true) {
        document.getElementById("qrcodeElement").innerHTML = "";
        new QRCode(document.getElementById("qrcodeElement"),url);
    }
}

function setCurrencyButton() {
    if (unsupportedCurrency === false) {
        document.getElementById("donationbutton").src = 'https://img.shields.io/badge/donate-' + currency_code + '-brightgreen.svg?style=flat-square';
    } else {
        document.getElementById("donationbutton").src = "/img/donate-EUR-brightgreen.svg";
    }
}

$(document).keyup(function(e) {
    if ($(".input1:focus") && (e.keyCode === 13)) {
        donate();
    }
});
