/**
 * setup.js — runs before the test framework initialises.
 * Sets DNS servers so MongoDB Atlas SRV lookups work in test environment.
 */
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
