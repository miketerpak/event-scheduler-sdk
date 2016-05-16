'use strict'

const events = require('./index')

events.conf.update({
    endpoint: ''
})

events
    .add('assignment', 'bunman', {
        run_at: new Date(Date.now() + 3600000)
    })
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