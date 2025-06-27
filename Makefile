.PHONY: test mammoth-plus.js npm-install

test:
	npm test

setup: npm-install mammoth-plus.min.js

npm-install:
	npm install

mammoth-plus.js:
	node_modules/.bin/browserify lib/index.js --standalone mammoth-plus -p browserify-prepend-licenses > dist/$@

mammoth-plus.min.js: mammoth-plus.js
	node_modules/.bin/uglifyjs dist/mammoth-plus.js -c > dist/$@
