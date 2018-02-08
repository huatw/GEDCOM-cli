'use strict'

const fs = require('fs')
const path = require('path')

const program = require('commander')
const emoji = require('node-emoji')
const chalk = require('chalk')

const packageJson = require('../package.json')
const {parse, normalize} = require('./parser')
const validate = require('./validate')
const {getIndiTable, getFamiTable} = require('./getTable')

program
  .version(packageJson, '-v, --version')
  .usage('[command] [options]')
  .command('parse')
  .description('parse and show gedcom file in table')
  .option('-f, --file <fileName>', 'parse single file')
  .option('-d, --directory <foldName>', 'parse all files under directory')
  .action(function (opt) {
    if (opt.file) {
      runFile(opt.file)
    }
    else if (opt.directory) {
      runFiles(opt.directory)
    }
    else {
      this.help()
    }
  })

program
  .command('*')
  .description(`${emoji.get('point_up')} only above commands are valide.`)
  .action(() => program.help())

program.parse(process.argv)

if (!program.args.length) {
  program.help()
}

/**
 * parse and output single file
 * @param {string} fileName 
 */
function runFile (fileName) {
  const filePath = path.join(__dirname, '../', fileName)

  fs.readFile(filePath, 'utf8', (err, fileStr) => {
    if (err) {
      throw err
    }

    const {indi, fami} = parse(fileStr)
    const {
      indi: normalizedIndi,
      fami: normalizedFami
    } = normalize({indi, fami})

    // output table
    console.log()
    console.log('>'.repeat(100))
    console.log(chalk.bold.bgGreen('TABLE: '), chalk.green.underline(fileName))
    console.log(chalk.bold.green('INDIVIDUAL'))
    console.log(getIndiTable(normalizedIndi))
    console.log(chalk.bold.green('FAMILY'))
    console.log(getFamiTable(normalizedFami))

    // output errors and anomalies
    const {errors, anomalies} = validate(indi, fami)

    errors.forEach((error) => {
      console.log()
      console.log(emoji.get('x'), chalk.red('Error:'), error)
    })
    anomalies.forEach((anomaly) => {
      console.log()
      console.log(emoji.get('exclamation'), chalk.yellow('Anomaly:'), anomaly)
    })
  })
}

/**
 * parse and output all file under foldName
 * @param {string} foldName 
 */
function runFiles (foldName) {
  const foldPath = path.join(__dirname, '../', foldName)

  fs.readdir(foldPath, (err, files) => {
    files.forEach(fileName => {
      runFile(path.join(foldName, fileName))
    })
  })
}
