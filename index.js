'use strict'

const Promise = require('bluebird')
const superagent = require('superagent')

Promise.promisifyAll(superagent)

// Errors relating to event-related errors
class EventError extends Error {
    constructor(message) {
        super(message)
        this.name = 'EventError'
    }
}
// Errors relating to the scheduling server
class SchedulerError extends Error {
    constructor(message) {
        super(message)
        this.name = 'SchedulerError'
    }
}

/**
 * Error handler for interacting with the Scheduler server
 * 
 * @param err {Error|Object}
 * 
 * @returns {Promise}
 */
function errorHandler(_error) {
    let error = _error

    if (_error instanceof Error) {
        if (_error.response instanceof superagent.Response) {
            error = new EventError(_error.response.body.error.message)
            error.status = _error.response.statusCode || 500
        } else {
            error = new SchedulerError(_error.message)
            error.status = _error.status || _error.statusCode || 500
        }
    }

    throw error
}

class Event {

    /**
     * new Event
     * 
     * @param options {Object}
     * @param options.slug {String}
     * @param options.key {String} optional
     * @param options.run_at {Date|Integer}
     * @param options.recurring {false|Object} see "recurring"
     * @param options.failed {Boolean} optional, default false
     * @param options.failed_code {null|Integer} optional, default null
     * @param options.failed_response {null|String|Object} optional, default null
     * @param options.request {Object}
     * @param options.request.href {String}
     * @param options.request.headers {Object}
     * @param options.request.method {String} optional, default 'GET'
     * @param options.request.body {Object}
     * @param options.request.querystring {Object}
     */
    constructor({
        slug,
        key = '',
        request: {
            href,
            headers = {},
            method = 'GET',
            path = '/',
            body,
            querystring
        } = {},
        run_at,
        recurring = false,
        failed = false,
        failed_code = null,
        failed_response = null
    } = {}) {
        this.slug = slug
        this.key = key
        this.request = {
            href,
            headers,
            method,
            body,
            querystring
        },
        this.run_at = new Date(run_at)
        this.recurring = recurring
        this.failed = failed
        this.failed_code = failed_code
        this.failed_response = failed_response
    }
}

class Scheduler {

    /**
     * @param options {Object}
     * @param options.host {String} optional, default 'localhost'
     * @param options.port {Integer} optional, default 5665
     */
    constructor({ endpoint, host = 'localhost', port = 5665 } = {}) {
        this.endpoint = endpoint || `http://${host}:${port}`
    }

    /**
     * Create a new event
     * 
     * @param slug {String}
     * @param key {String} optional
     * @param params {Object} see "new Event"
     * 
     * @returns {Promise}
     */
    add(slug, key = '', params = {}) {
        if (!slug) {
            let err = new EventError('Missing required parameter: slug')
            err.status = 400
            return Promise.reject(err)
        }

        return superagent
            .post([this.endpoint, slug, key].join('/'))
            .send(params)
            .endAsync()
            .then(res => res.body.result ? new Event(res.body.result) : null)
            .catch(errorHandler)
    }

    /**
     * Get the event with the following slug and key
     * 
     * @param slug {String}
     * @param key {String} optional
     * 
     * @returns {Promise}
     */
    get(slug, key = '') {
        if (!slug) {
            let err = new EventError('Missing required parameter: slug')
            err.status = 400
            return Promise.reject(err)
        }
        if (slug instanceof Event) {
            let _event = slug
            slug = _event.slug
            key = _event.key
        }

        return superagent
            .get([this.endpoint, slug, key].join('/'))
            .endAsync()
            .then(res => res.body.result ? new Event(res.body.result) : null)
            .catch(errorHandler)
    }

    /**
     * Fetch a list of events
     * 
     * @param slug {String} optional
     * @param before {Date|Integer} optional
     * @param after {Date|Integer} optional
     * @param failed {Boolean} optional
     * 
     * @returns {Promise}
     */
    list({ slug, before, after, failed } = {}) {
        let query = ''
        if (slug) query += 'slug=' + encodeURIComponent(slug) + '&'
        if (before) query += 'before=' + encodeURIComponent(new Date(before).toISOString()) + '&'
        if (after) query += 'after=' + encodeURIComponent(new Date(after).toISOString()) + '&'
        if (typeof failed === 'boolean') query += 'failed=' + (failed ? 'true' : 'false') + '&'
        if (typeof failed === 'string') query += 'failed=' + failed.toLowerCase() + '&'
        return superagent
            .get(this.endpoint + '/list?' + query)
            .endAsync()
            .then(res => res.body.result.map(e => new Event(e)))
            .catch(errorHandler)
    }

    /**
     * Remove the event with the following slug and key
     * 
     * @param slug {String}
     * @param key {String} optional
     * 
     * OR
     * 
     * @param event {Event}
     * 
     * @returns {Promise}
     */
    remove(slug, key = '') {
        if (!slug) {
            let err = new EventError('Missing required parameter: slug')
            err.status = 400
            return Promise.reject(err)
        }
        if (slug instanceof Event) {
            let _event = slug
            slug = _event.slug
            key = _event.key
        }

        return superagent
            .del([this.endpoint, slug, key].join('/'))
            .endAsync()
            .then(res => res.body.result.deleted)
            .catch(errorHandler)
    }
    
    /**
     * Update the event matching the slug+key with the following updates
     * 
     * @param slug {String}
     * @param key {String} optional
     * @param updates {Object} see "new Event"
     * 
     * OR
     * 
     * @param event {Event}
     * @param updates {Object} see "new Event"
     * 
     * @returns {Promise}
     */
    update(slug, key = '', updates = {}) {
        if (!slug) {
            let err = new EventError('Missing required parameter: slug')
            err.status = 400
            return Promise.reject(err)
        }
        if (slug instanceof Event) {
            let _event = slug
            updates = key
            slug = _event.slug
            key = _event.key
        }

        return superagent
            .put([this.endpoint, slug, key].join('/'))
            .send(updates)
            .endAsync()
            .then(res => res.body.result ? new Event(res.body.result) : null)
            .catch(errorHandler)
    }
}

module.exports = options => new Scheduler(options)
module.exports.EventError = EventError
module.exports.SchedulerError = SchedulerError