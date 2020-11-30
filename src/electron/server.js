let express = require('express');
const DBProxy = require("./db-proxy");

let app = express();
app.use(express.json());

const connections = [];

module.exports.initialize = () => {
    let server = app.listen(9771, function () {
        console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
    });

    app.post('/connect', async function (request, response) {
        await DBProxy.connect(request.body);
        response.send('OK');
    });

    app.post('/disconnect', async function (request, response) {
        await DBProxy.disconnect(request.body.name);
        response.send('OK');
    });

    app.post('/query', async function (request, response) {
        console.log(request.body);
        try {
            let payload = await DBProxy.query(request.body.name, request.body.sql, request.body.offset, request.body.pageSize);
            response.send(JSON.stringify(payload));
        } catch (e) {
            response.status(400).send(String(e))
        }
    });
}

