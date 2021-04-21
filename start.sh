#!/bin/bash
echo "Press CTRL-C to stop the server"
sensible-browser http://localhost:3010 & 
node pure_server.js