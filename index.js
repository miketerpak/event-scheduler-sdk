'use strict'

const fs = require('fs')
const superagent = require('superagent')
let config = {}

function Event({
    slug,
    key, 
    endpoint,
    run_at,
    recurring,
    payload,
    fail_count
} = {}) {
    this.slug = slug
    this.key = key
    this.endpoint = endpoint
    this.recurring = recurring
    this.run_at = run_at ? new Date(run_at) : undefined,
    this.fail_count = fail_count
    this.payload = payload
}

module.exports.add = function(slug, key, params) {
    if (!config.endpoint) throw new Error('Missing event server endpoint in configuration')
    return new Promise((resolve, reject) => {
        if (!slug) return reject({
            code: 400,
            msg: 'Missing required parameter: slug'
        })
        
        superagent
            .post([config.endpoint, slug, key].join('/'))
            .send(params)
            .end((err, res) => {
                if (err) reject(err.response.body)
                else if (res.body.error) reject(res.body.error)
                else resolve(new Event(res.body.result))
            })
    })
}

module.exports.conf = {
    loadFromPath: function(path) {
        let data = fs.readFileSync()
        try {
            data = JSON.parse(data)
        } catch(e) {
            console.error(`Error parsing config file at ${path}`)
            throw e
        }
        module.exports.update(data)
    },
    update: function(updates) {
        for (let i in updates) {
            if (updates.hasOwnProperty(i)) {
                config[i] = updates[i]
            }
        }
    }
}

module.exports.get = function(slug, key) {
    if (!config.endpoint) throw new Error('Missing event server endpoint in configuration')
    return new Promise((resolve, reject) => {
        if (!slug) return reject({
            code: 400,
            msg: 'Missing required parameter: slug'
        })
        
        superagent
            .get([config.endpoint, slug, key].join('/'))
            .end((err, res) => {
                if (err) reject(err.response.body.error)
                else if (res.body.error) reject(res.body.error)
                else resolve(res.body.result ? new Event(res.body.result) : null)
            })
    })
}

module.exports.remove = function(slug, key) {
    if (!config.endpoint) throw new Error('Missing event server endpoint in configuration')
    return new Promise((resolve, reject) => {
        if (!slug) return reject({
            code: 400,
            msg: 'Missing required parameter: slug'
        })
        
        superagent
            .del([config.endpoint, slug, key].join('/'))
            .end((err, res) => {
                if (err) reject(err.response.body.error)
                else if (res.body.error) reject(res.body.error)
                else resolve(res.body.result.deleted)
            })
    })
}

module.exports.update = function(slug, key, updates) {
    if (!config.endpoint) throw new Error('Missing event server endpoint in configuration')
    return new Promise((resolve, reject) => {
        if (!slug) return reject({
            code: 400,
            msg: 'Missing required parameter: slug'
        })
        
        superagent
            .put([config.endpoint, slug, key].join('/'))
            .send(updates)
            .end((err, res) => {
                if (err) reject(err.response.body.error)
                else if (res.body.error) reject(res.body.error)
                else resolve(new Event(res.body.result))
            })
    })
}