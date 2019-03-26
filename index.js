'use strict'

const ccxt = require('ccxt')
const cron = require('node-cron')
const fs = require('fs')
const ex = new ccxt.binance()

/* Trades - CRON Job */
cron.schedule('0,15,45 * * * * *', () => {
  const Q_MAX = 500
  const path = `${__dirname}/trades`
  let lastId = null
  let q = []
  let count = 0 

  fs.mkdir(path, {recursive: true}, e => console.log)
  
  ex.fetchTrades('BTC/USDT')
  .then(trades => {
    if (lastId !== null) {
      let newTrades = []
      for (let i = trades.length - 1; i > -1; i--) {
        if (trades[i].id === lastId) {
          newTrades = trades.slice(i + 1)
          lastId = newTrades[newTrades.length - 1].id
          q.push(...newTrades)
          break;
        }
      }
    } else {
      //first push
      q.push(...trades)
      lastId = trades[trades.length - 1].id
    }
    
    console.log('q length', q.length)
    // write to file
    if (q.length >= Q_MAX) {
      let toWrite = q.slice(0, Q_MAX)
      q = q.slice(Q_MAX)
      fs.writeFileSync(`${path}/${count}.json`, JSON.stringify(toWrite))
      count += 1
    }
  })
  .catch(console.log)
})

cron.schedule('0,10,20,30,40,50 * * * * *', () => {
  fs.mkdir(`${__dirname}/ob`, {recursive: true}, e => console.log)
  
  ex.fetchOrderBook('BTC/USDT')
  .then(ob => {
    fs.writeFileSync(`${__dirname}/ob/${new Date().getTime()}.json`, JSON.stringify(ob))
  })
  .catch(console.log)
})