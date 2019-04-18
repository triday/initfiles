require("tsharp");
var program = require("commander");
var package = require("../package.json");
var fs = require("fs");
var path = require("path");
var log = require('logtick').default;


var ERROR_JS_TEMPLATE_FILE = 'Js template file must be export a function and return a array.!';
var VALID_ITEM_DATA = 'Js template file return item must be contains "name" and "content" properties';
var TEMPLATE_FILE_NOT_EXISTS = 'The Js template file {0#blue} does not exists.';
var FILE_EXISTS = 'The file {0#blue} has exists.';
function showHelp() {
    var tempFile = 'templates/abc.js';
    var binName = Object.keys(package.bin)[0];
    var firstLine = String.format(`1. Create a custom template file. eg: {0#blue} 
   And the {0#blue} should like this:`, tempFile);
    var code = `    module.exports = function (arg1, arg2) {
        return [
            {
                name: \`src/pages/\${arg1}/\${arg2}.js\`,
                content: '// this is js content'
            },
            {
                name: \`src/pages/\${arg1}/index.js\`,
                type: 'append',
                content: '// this is append content'
            }
        ]
    }`;
    var command = String.format("{0} -t {1} value1 value2", binName, tempFile)
    var secondLine = String.format('2. Run command {0#blue}', command)

    console.log('')
    console.log('Example:');
    console.log(firstLine);
    console.log(code.toColorful("magenta"));
    console.log(secondLine);
}

function check(condition, message) {
    if (!condition) throw new Error(message);
}

function isValidItem(data) {
    return typeof data === "object" && data !== null && "name" in data && "content" in data;
}
function runTemplate(template, ...args) {
    try {
        check(fs.existsSync(template), String.format(TEMPLATE_FILE_NOT_EXISTS, template));
        var func = require(path.resolve(template));
        check(typeof func === "function", ERROR_JS_TEMPLATE_FILE);
        var datas = func(...args) || [];
        check(Array.isArray(datas), ERROR_JS_TEMPLATE_FILE);
        datas.forEach(p => check(isValidItem(p), VALID_ITEM_DATA));
        datas.forEach(p => handleItem(p));
    } catch (ex) {
        log.error(ex.message);
    }
}
function handleItem(dataItem) {
    var filename = dataItem.name;
    var type = dataItem.type || 'create';
    var content = dataItem.content;
    if (type === "append") {
        mkdirsSync(path.dirname(filename));
        fs.appendFileSync(filename, content, 'utf8');
        log.info("Append file {0#blue} {1#green}!", filename, 'success');
    } else {
        check(!fs.existsSync(filename), String.format(FILE_EXISTS, filename));
        mkdirsSync(path.dirname(filename));
        fs.writeFileSync(filename, content, 'utf8');
        log.info("Create file {0#blue} {1#green}!", filename, 'success');
    }
}
function mkdirsSync(dirname) {
    if (!fs.existsSync(dirname)) {
        mkdirsSync(path.dirname(dirname));
        fs.mkdirSync(dirname);
        log.info('Make dir {0#blue} {1#green}!', dirname, 'success');
    }
}


program
    .version(package.version, '-v --version')
    .option("-t, --template <template> [args...]", "template js file.")
    .on('--help', showHelp)
    .parse(process.argv);
if (program.template) {
    runTemplate(program.template, ...program.args);
} else {
    program.outputHelp(p=>p.toColorful("red"));
}
