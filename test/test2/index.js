#!/usr/bin/env node

const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");

const run = async () => {
  try {
    // show script introduction
    init();
    // ask questions (which extensions do you want to edit?)
    const answers = await ask();
    // gather list of files
    const files = gatherFiles(answers);
    // ask user if they wish to proceed
    const proceed = await confirmFiles(files);
    // edit files
    proceed.proceed ? edit(files) : console.log(chalk.green('Aborting!'));
    // show success message
    console.log(chalk.green('\nAll done! :)'));
  } catch (e) {
    console.log(`Unfortunately something went wrong during execution :(\n${e}`);
  }
};

const init = () => {
  const bannerText = figlet.textSync('Recursive File Extension Editor', { font: 'slant' });
  const banner = chalk.green(bannerText);
  console.log(banner);
};

const ask = () => {
  return new Promise((resolve, reject) => {
    const questions = [
      {
        name: 'dir',
        type: 'input',
        message: 'Which directory do you want to have recursively edited? (relative path)',
        default: '.'
      },
      {
        name: 'extensions',
        type: 'checkbox',
        message: 'Which extensions do you want to have edited?',
        choices: [ 'js', 'html', 'css', 'exe' ]
      },
      {
        name: 'reverse',
        type: 'confirm',
        default: false
      }
    ];
    inquirer.prompt(questions)
      .then((answers) => { resolve(answers); })
      .catch((err) => { reject(err); });
  });
};

const gatherFiles = (opts) => {
  const dir = opts.dir;
  const exts = opts.extensions;
  const r = `.(${exts.join('|')})$`
  // exclude node_modules
  const extsRegex = new RegExp(`^(?!node_modules).*\\.(${exts.join('|')})$`);
  const files = shell.find(dir).filter((file) => file.match(extsRegex));
  // files to be edited
  return files;
}

const confirmFiles = (files) => {
  return new Promise((resolve, reject) => {
    console.log(chalk.green(files));
    const proceed = [
      {
        name: 'proceed',
        type: 'confirm',
        message: 'Are these the files you want to edit?',
        default: false
      }
    ];
    inquirer.prompt(proceed)
      .then((answer) => { resolve(answer); })
      .catch((err) => { reject(err); });
  });
}

const edit = (files, reverse) => {
  const map = {
    js: {
      forward: {
        test: /.js$/,
        replace: '.sj'
      },
      reverse: {
        test: /.sj$/,
        replace: '.js'
      }
    }
  }
  // rename files
  files.forEach((file) => {
    let regex = !reverse ? map.js.forward.test : map.js.reverse.test;
    let replace = !reverse ? map.js.forward.replace : map.js.reverse.replace;

    if (regex.test(file)) {
      const edited = file.replace(regex, replace);
      shell.mv(file, edited);
      console.log(chalk.blue(`${file}\t\t\t->\t${edited}`));
    }
  });
}

run();