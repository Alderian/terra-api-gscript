// Time to wait in miliseconds to call function.
// this is to sparse function calling.
// Recomended 5 seconds = 5 * 1000
// The maximum allowed value is 300000 (or 5 minutes). (Google Apps reference limit)
var waitInMiliseconds = 5 * 1000;

// How many times should we retry a failed funcion call
// This is to avoid function calling too many times and to exceed function timeout
// Recomended 3 times
var maxCallingTimes = 3;

// Cache timeout
// Avoids too much refreshed over time to prevent API from failing with too many calls
// Timeout in seconds
// Recomended 10 minutes, 600 seconds
var cacheTimeout = 600;

/**
 * --------------------------------------------------------------------------------------------
 * Google Sheet Scripts for Terra FCD API by Alderian
 * --------------------------------------------------------------------------------------------
 * 
 * getTerraBalance       Gets Terra token balance on your wallet
 * getTerraTokenBalance  Gets ANY token balance on your wallet. It can get any contract balance
 * 
 */

 var apiTerraURL = "https://fcd.terra.dev/";

/** getTerraBalance
 * 
 * Gets Terra token balance on your wallet
 * 
 * @param {terraAddress}             the wallet terra address, in the form of 0x12345... 
 * @param {myApiKey}                the your api-key to use Terra Api
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @param {calledTimes}             the number of times this function was called to control how many times its called
 * @returns 
 */
async function getTerraBalance(terraAddress, myApiKey, parseOptions, calledTimes = 0) {

  Logger.log("run: " + terraAddress + myApiKey + parseOptions + calledTimes)

  if (calledTimes >= maxCallingTimes) {
    return "Error: called too many times. " + calledTimes;
  }

  id_cache = 'Terra' + terraAddress + 'Terrabalance'
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {

  Logger.log("cached: " + cached)

    return Number(cached);
  }

  try {
    Utilities.sleep(Math.random() * 100 + waitInMiliseconds)
    url = apiTerraURL + "cosmos/bank/v1beta1/balances/" + terraAddress;

    var res = await UrlFetchApp.fetch(url)
    var content = res.getContentText();

  Logger.log("content: " + content)

    var parsedJSON = JSON.parse(content);

  Logger.log("parsedJSON: " + parsedJSON)

    var balance = Number(parseFloat(parsedJSON.balances[0].amount) / 1000000);
    cache.put(id_cache, balance, cacheTimeout);
    return balance;
  }
  catch (err) {
    return getTerraBalance(terraAddress, myApiKey, parseOptions, calledTimes++);
  }

}

/** getTerraTokenBalance
 * 
 * Gets ANY token balance on your wallet. It can get any contract balance
 * 
 * @param {terraAddress}              the wallet terra address, in the form of 0x12345... 
 * @param {tokenContract}           the token contract to get
 * @param {myApiKey}                the your api-key to use Terra Api
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @param {calledTimes}             the number of times this function was called to control how many times its called
 * @returns 
 */
async function getTerraTokenBalance(terraAddress, tokenContract, myApiKey, parseOptions, calledTimes = 0) {
  Logger.log("run: " + terraAddress + tokenContract + myApiKey + parseOptions + calledTimes)

  if (calledTimes >= maxCallingTimes) {
    return "Error: called too many times. " + calledTimes;
  }

  id_cache = 'Terra' + terraAddress + tokenContract + 'balance'
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
  Logger.log("cached: " + cached)
    return Number(cached);
  }

  try {
    Utilities.sleep(Math.random() * 100 + waitInMiliseconds)
    url = apiTerraURL + "/wasm/contracts/" + tokenContract + "/store?query_msg=%7B%22balance%22:%7B%22address%22:%22" + terraAddress +"%22%7D%7D"

    var res = await UrlFetchApp.fetch(url)
    var content = res.getContentText();

  Logger.log("content: " + content)

    var parsedJSON = JSON.parse(content);

  Logger.log("parsedJSON: " + parsedJSON)

    var balance = Number(parseFloat(parsedJSON.result.balance) / 1000000);
    cache.put(id_cache, balance, cacheTimeout);
    return balance;
  }
  catch (err) {
    return getTerraTokenBalance(terraAddress, tokenContract, myApiKey, parseOptions, calledTimes++);
  }

}
