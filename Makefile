REPORTER = list

test:
	cd gyoji && npm install && npm test
	cd harite && npm install && npm test

.PHONY: test
