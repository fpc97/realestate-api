const http = require('http');
// const path = require('path');

// const {defaultFile} = require('./default-file');

const {
  separateParameters,
  getValues,
  changePage,
  generateFilters,
  filterBetween,
  filterContains,
  methodSort,
  methodPaginate,
  methodRoutes
} = require('./service');

module.exports = http.createServer((req, res) => {
  const {method, url} = req;
  const [route, query] = separateParameters(url),
    relativeRoute = route.replace('/realestate', '') || '/';
  const [,, base, id, ext] = relativeRoute.split('/'),
    cleanID = !isNaN(parseInt(id)) && parseInt(id).toString() === id && typeof ext === 'undefined';

  // Prepare response
  const response = {
    type: 'application/json',
    success: false,
    content: null,
    status: 400
  };

  // Routing
  return new Promise(resolve => {
    const DB = require('./db.json');

    if (method === 'GET' && relativeRoute === '/api/props') {
      console.log('get all props')
      const parameters = getValues(query);
      const filters = generateFilters(parameters),
        sort = {prop: parameters.sortBy, direction: parameters.sortOrder !== 'desc'},
        pagination = {page: parseInt(parameters.page)||1, forPage:parameters.forPage||20};

      const resultsFilter = filterBetween(
        filterContains(
          DB,
          filters.co
        ),
        filters.bw
      );
      
      // Results
      const resultsSort = methodSort(resultsFilter, sort);
      const resultsPaginate = methodPaginate(resultsSort, pagination);
      const resultsRoutes = methodRoutes(resultsPaginate, req);

      response.status = 200;
      response.success = true;

      const pages = Math.ceil(resultsFilter.length / pagination.forPage);

      response.content = JSON.stringify({
        total: resultsFilter.length,
        forPage: pagination.forPage,
        pages: pages,
        previous: pagination.page <= 1
          ? ''
          : 'https://' + req.headers.host + route + '?' + changePage(query, pages, pagination.page, false),
        next: pagination.page >= pages
          ? ''
          : 'https://' + req.headers.host + route + '?' + changePage(query, pages, pagination.page, true),
        results: resultsRoutes
      });
    } else if (method === 'GET' && base === 'props' && cleanID) {
      response.content = JSON.stringify(DB.find(inm => inm.id === parseInt(id)));
      response.status = 200;
      response.success = true;
    } else {
      response.status = 404;
    }

    resolve();
  })
  .then(() => {
    res.writeHead(response.status, {
      'Content-type': response.type,
      'Access-Control-Allow-Origin': response.type === 'application/json'
        ? '*'
        : req.headers.host
    });
    
    res.end(response.content, 'utf8');
  })
  .catch(err => {
    console.error(`There has been an error retrieving ${req.url}`, err)
    res.writeHead(response.status, {
      'Content-type': response.type
    });

    res.end(response.content, 'utf8');
  });
})