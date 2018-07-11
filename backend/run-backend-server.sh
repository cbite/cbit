#!/bin/bash

/usr/bin/env gunicorn --preload -c config/gunicorn-config.py -w 4 backend-server:app
