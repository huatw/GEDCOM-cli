# GEDCOM-cli

## About

A Node.js terminal tool that parses input [GEDCOM](http://en.wikipedia.org/wiki/GEDCOM) files, displays family relationships in table and detects errors or anomalies in individual information and relationship.

## Design

* Read raw GEDCOM
* Parse every line into ```Line``` model
* Transform each ```Line``` into ```Family``` or ```Individual``` model
* Output individuals and families as two tables
* Validate and output errors or anomalies message

## Usage

```bash
# clone project
git clone <..>

# download dependencies
yarn install

# parse specific file
yarn start parse -f gedcom/pass/test.ged

# parse all files under specific directory
yarn start parse -d <folder>

# parse passed cases
yarn start parse -d gedcom/pass

# parse failed cases
yarn start parse -d gedcom/fail

# see helper for usage
yarn start -h

# run unit test
yarn run test
```
