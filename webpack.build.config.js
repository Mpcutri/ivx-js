
let buildPaths = ["dist"];

try {
    const tcProps = require('teamcity-properties');
    const buildNumber = tcProps['build.number'] ? tcProps['build.number'] : "";

    buildPaths = [].concat(buildPaths, [
        "build/cdn/ivx-js/" + buildNumber,
    ])
} catch (err) {
    console.error("Teamcity didn't build due to the following errors:");
    console.error(err);
}


const allConfigs = [].concat(
    require('./webpack.angular.config'),
    require('./webpack.modules.config')
);
const currentConfigs = allConfigs.reduce((updateConfigs, config) => {
    return updateConfigs.concat(
        config.buildConfigs(buildPaths)
    );
}, []);

module.exports = currentConfigs;