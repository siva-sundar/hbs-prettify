#! /usr/bin/env node
/* eslint-env node */

const fs = require('fs');
const glimmerSyntax = require('@glimmer/syntax');
const templateIndent = require('./template-indent');
const find = require('find');
const {
  preprocess,
  print
} = glimmerSyntax;


function performIndent(filePath) {
  let inputFile = fs.readFileSync(filePath).toString();
  let ast = preprocess(inputFile, {
    plugins: {
      ast: [templateIndent]
    }
  });
  fs.writeFileSync(filePath, print(ast));
}


function processArgs(path) {
  if (path.endsWith('.hbs')) {
    performIndent(path);
  } else {
    let files = find.fileSync(/\.hbs$/, path);
    files.forEach((file) => {
      performIndent(file);
    });
  }
}

const args = process.argv.slice(-1);

if (args.length === 1) {
  try {
    processArgs(args[0]);
  } catch (e) {
    throw e;
  }
} else {
  throw new Error('Too many arguments, pass a file or folder name');
}
