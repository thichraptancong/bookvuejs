'use strict';

/**
 * Module dependencies
 */
var acl = require('acl')
const { USERS } = require('../constant/index');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Permissions
 */
acl.allow([{
    roles: [USERS.ROLE.ADMIN],
    allows: [{
        resources: '/apis/users/',
        permissions: ['get', 'post']
    }, {
        resources: '/apis/users/paginguser',
        permissions: ['post']
    }, {
        resources: '/apis/users/:_id',
        permissions: ['put', 'delete', 'get']
    }, {
        resources: '/apis/categories/',
        permissions: ['get', 'post']
    }, {
        resources: '/apis/categories/pagingcate',
        permissions: ['post']
    }, {
        resources: '/apis/categories/:_id',
        permissions: ['put', 'delete', 'get']
    }, {
        resources: '/apis/categories/search',
        permissions: '*'
    }, , {
        resources: '/apis/books/',
        permissions: ['get', 'post']
    }, {
        resources: '/apis/books/search',
        permissions: '*'
    }, {
        resources: '/apis/books/:_id',
        permissions: ['put', 'delete', 'get']
    }, {
        resources: '/apis/books/pagingbook',
        permissions: ['post']
    }]
}, {
    roles: [USERS.ROLE.CONTRIBUTOR],
    allows: [{
        resources: '/apis/users/',
        permissions: ['get', 'post']
    }, {
        resources: '/apis/users/paginguser',
        permissions: ['post']
    }, {
        resources: '/apis/users/:_id',
        permissions: ['put', 'get']
    }, {
        resources: '/apis/categories/',
        permissions: ['get', 'post']
    }, {
        resources: '/apis/categories/pagingcate',
        permissions: ['post']
    }, {
        resources: '/apis/categories/:_id',
        permissions: ['put', 'get']
    }, {
        resources: '/apis/books/',
        permissions: ['get', 'post']
    }, {
        resources: '/apis/books/:_id',
        permissions: ['put', 'delete', 'get']
    }, {
        resources: '/apis/books/pagingbook',
        permissions: ['post']
    }, {
        resources: '/apis/categories/search',
        permissions: '*'
    }, ]
}, {
    roles: [USERS.ROLE.NORMAL],
    allows: [{
        resources: '/apis/books',
        permissions: '*'
    }, {
        resources: '/apis/books/pagingbook',
        permissions: ['post']
    }, {
        resources: '/apis/users',
        permissions: ['get']
    }, {
        resources: '/apis/categories/search',
        permissions: '*'
    }, ]
}]);

module.exports = acl;