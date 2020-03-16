const spawn = require("child_process").spawn;
const disk = require('diskusage');

function getDrivers(){
    const list  = spawn('cmd');

    return new Promise((resolve, reject) => {
        list.stdout.on('data', function (data) {
            const output =  String(data);
            const out = output.split("\r\n").map(e=>e.trim()).filter(e=>e!="");
            if (out[0]==="Name"){
                resolve(out.slice(1));
            }
        });

        list.on('exit', function (code) {
            if (code !== 0){
                reject(code);
            }
        });

        list.stdin.write('wmic logicaldisk get name\n');
        list.stdin.end();
    })
}

async function getInfoByPath(path) {
    return disk.check(path);
}

(async () => {
    const aDrivers = await getDrivers();
    const aData = await Promise.all(aDrivers.map((sDriverPath) => getInfoByPath(sDriverPath)));
    const aResults = aDrivers.map((sDriverPath, iIndex) => {
        aData[iIndex].type = 'disk';
        aData[iIndex].path = sDriverPath;
        const { available, ...oResult } = aData[iIndex];
        return oResult;
    });
    console.log(aResults);
})()
 

