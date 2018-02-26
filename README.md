# GEDCOM-cli

## Usage

```bash
# clone project
git clone <..>

# download dependencies
yarn install # or npm install

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

## todo
main function and workflow is done.

* more user stories(in validate.js)
* more testing cases of user stories(in test folder)
