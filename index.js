const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

////////////////////////////////////////////////////////////////
//FILES

// blocking and synchronus way
// synchronous reading and returning data from file
/*
const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(textIn);

// synchronous writing to a file
const textOut = `Information about avocado: ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", textOut);
console.log("file written");
*/
// non-blocking and asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   if (err) return console.log("ERROR! 💥");

//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     // console.log(data2);
//     fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
//       //   console.log(data3);

//       //   we did not read any data so only one arg in callback
//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("Your file has been written 😁");
//       });
//     });
//   });
// });
// console.log("Will read file!");
// so we implemented multiple steps one after other with callbacks, steps that depend on result of previous step
////////////////////////////////////////////////////////////////////////

//SERVER

// top level code, before anything happens, when program starts for first time it will read data
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);

// creating a slug
const slugs = dataObject.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

// callback in createServer() will fire when a new request hits our server
const server = http.createServer((request, response) => {
  // to look at the url
  const { pathname, query } = url.parse(request.url, true);

  // if pathname is either root or /overview
  if (pathname === '/' || pathname === '/overview') {
    response.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObject.map((el) => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    response.end(output);

    // PRODUCT
  } else if (pathname === '/product') {
    response.writeHead(200, { 'Content-type': 'text/html' });
    const product = dataObject[query.id];
    const output = replaceTemplate(tempProduct, product);
    response.end(output);

    //API
  } else if (pathname === '/api') {
    // browser expects JSON text now
    response.writeHead(200, { 'Content-type': 'application/json' });
    // this method needs to send a string not an object
    response.end(data);

    //NOT FOUND
  } else {
    // respond with a 404 status, sends a response header to the request
    response.writeHead(404, {
      // browser is expecting html now
      'Content-type': `text / html`,
      // we can also specify our own made up headers
      'my-own-header': 'hello world',
    });
    // respond with html
    response.end('<h1>page could not be found</h1>');
  }

  // send repsonse to the client
  // response.end("hello, from the server!");
});

//listen to incoming request on local host IP on port 8000, this starts the server
// callback will run as soon as server starts listening
server.listen(8000, '127.0.0.1', () => {
  console.log('server has started, listening to requests on port 8000');
});
