'use strict'

const events = require('./index')

events.conf.update({
    endpoint: 'ec2-54-174-49-161.compute-1.amazonaws.com:3000'
})

events
    .add('assignment', 'bunman')
    .then(console.log)
    .catch(console.error)
events
    .get('assignment', 'bunman')
    .then(console.log)
    .catch(console.error)
events
    .update('assignment', 'bunman', { endpoint: String(Math.floor(Math.random() * 100000)) })
    .then(console.log)
    .catch(console.error)
events
    .get('assignment', 'bunman')
    .then(console.log)
    .catch(console.error)
events
    .remove('assignment', 'bunman')
    .then(console.log)
    .catch(console.error)
events
    .get('assignment', 'bunman')
    .then(console.log)
    .catch(console.error)
events
    .add()
    .then(console.log)
    .catch(console.error)
events
    .remove('wefwe', 'fjewi')
    .then(console.log)
    .catch(console.error)