module.exports = {
    "parser": "babel-eslint",
    "plugins":[
        "react"
    ],
    "env": {
        "amd": true,
        "es6": true,
        "browser": true,
        "node": true
    },
    "rules":{
        "no-undef":2,
        "no-unused-vars":1,
        "react/jsx-uses-vars":2,
        // "react/jsx-uses-react": 2
    }
};