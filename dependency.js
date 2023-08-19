const dependencyTree = require("dependency-tree");
const prompts = require("prompts");
const path = require("path");

async function makeDepTree() {
    const { repoPath, filename, includeNodeModules, tsConfig } = await prompts([
        {
            type: "text",
            name: "repoPath",
            message: "What's the path to your repository?",
        },
        {
            type: "text",
            name: "filename",
            message: "What's the entry file?",
            initial: "src/index.js",
        },
        {
            type: "confirm",
            name: "includeNodeModules",
            message: "Include node_modules in graph?",
        },
        // {
        //     type: "text",
        //     name: "tsConfig",
        //     message: "What's the tsconfig file?",
        //     initial: "tsconfig.json",
        // },
    ]);

    const directory = path.resolve(__dirname, repoPath);

    const tree = dependencyTree({
        filename: path.resolve(directory, filename),
        directory: directory,
        tsConfig: tsConfig ? path.resolve(directory, tsConfig) : null,
        nonExistent: [],
        filter: (path) =>
            includeNodeModules ? path.indexOf("node_modules") === -1 : false,
        noTypeDefinitions: false,
    });

    printTree(directory, tree);
}

function printTree(directory, tree) {
    console.log(JSON.stringify(removePrefixFromKeys(directory, tree)));
}

makeDepTree();

// Returns a dependency tree object for the given file
//const tree = dependencyTree({
//  filename: 'websites/techletter.app/src/index.js',
//  directory: 'websites/techletter.app/src',
//  //tsConfig: 'member-portal/tsconfig.json', // optional
//  filter: path => path.indexOf('node_modules') === -1, // optional
//  nonExistent: [], // optional
//  noTypeDefinitions: false // optional
//});

// const tree = dependencyTree({
//     filename: "tia-ui/src/index.tsx",
//     directory: "tia-ui/src",
//     tsConfig: "tia-ui/tsconfig.json", // optional
//     filter: (path) => path.indexOf("node_modules") === -1, // optional
//     nonExistent: [], // optional
//     noTypeDefinitions: false, // optional
// });

// Written by ChatGPT
function removePrefixFromKeys(prefix, obj) {
    const traverse = (currentObj) => {
        for (let key in currentObj) {
            if (currentObj.hasOwnProperty(key)) {
                const newKey = key.startsWith(prefix)
                    ? key.substring(prefix.length)
                    : key;
                if (typeof currentObj[key] === "object") {
                    currentObj[newKey] = traverse(currentObj[key]);
                } else {
                    currentObj[newKey] = currentObj[key];
                }
                if (newKey !== key) {
                    delete currentObj[key];
                }
            }
        }
        return currentObj;
    };

    return traverse(obj);
}

// console.log(
//     JSON.stringify(
//         removePrefixFromKeys(tree, "/Users/Swizec/Documents/calendar-service/")
//     )
// );
// //console.log(require('util').inspect(removePrefixFromKeys(tree, '/Users/Swizec/Documents/member-portal/'), false, null))
