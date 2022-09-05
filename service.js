const VALID_FILTERS = [
  {key: 'type', op: 'co', rut: false},
  {key: 'operation', op: 'co', rut: false},
  {key: 'amenities', op: 'co', rut: false},
  {key: 'currency', op: 'co', rut: ['prices']},

  {key: 'built', op: 'bw', rut: false},
  {key: 'price', op: 'bw', rut: ['prices']},
  {key: 'expenses', op: 'bw', rut: ['prices']},
  {key: 'bedrooms', op: 'bw', rut: ['spaces']},
  {key: 'bathrooms', op: 'bw', rut: ['spaces']},
  {key: 'stories', op: 'bw', rut: ['spaces']},
  {key: 'area', op: 'bw', rut: ['spaces']},
  {key: 'hectares', op: 'bw', rut: ['spaces']},
  {key: 'hectaresField', op: 'bw', rut: ['spaces']},
  {key: 'timeMarketDays', op: 'bw', rut: false},
  {key: 'added', op: 'bw', rut: false},
  {key: 'edited', op: 'bw', rut: false}
];

const VALID_SORTS = [
  {key: 'address', op: '', rut: false},
  {key: 'apartment', op: '', rut: false},
  {key: 'floor', op: '', rut: false}
].concat(VALID_FILTERS);

const generateRoute = (rec, rut, key) => rut ? rec[rut][key] : rec[key];

const normalizeStr = str => str.replace(/(\-|\040|\%20)/, '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const imageRoutes = (images, req) => {
  const staticRoute = (process.env.PROXY || req.headers.host.split(':')[0])
    + '/img/';

  return images.map(f => {
    return f.startsWith(staticRoute) ?
      f :
      staticRoute + f;
  });
}
exports.imageRoutes = imageRoutes;

// Methods
exports.separateParameters = url => {
  const arr = url.split('?');
  
  if (arr[0].endsWith('/')) arr[0] = arr[0].slice(0, -1);
  
  return arr;
}

exports.getValues = params => {
  const arr = [];

  if (!params) return arr;
  params.split('&').forEach(param => arr.push(param.split('=')));

  return Object.fromEntries(arr);
};

exports.changePage = (url, pages, currentPage, side) => {
  const reg = new RegExp(`page=${currentPage}`);

  if (typeof url === 'undefined') return 'page=2';
  else if (url.indexOf('page') === -1) return url + '&page=2';
  
  return url.replace(reg, `page=${side ? Math.max(currentPage + 1, 1) : Math.min(currentPage - 1, pages)}`);
};

exports.generateFilters = params => {
  const obj = {co: [], bw: []};

  Object.entries(params).forEach(param => {
    const proto = VALID_FILTERS.find(val => val.key === param[0]);
    if (typeof proto !== 'undefined') obj[proto.op].push({key: param[0], val: param[1].split(','), rut: proto.rut});
  });
  
  return obj;
};

exports.filterBetween = (resources, params) => {
  return resources.filter(rec => {
    return params.every(par => {
      const element = generateRoute(rec, par.rut, par.key);
      return par.val[0] <= element && (typeof par.val[1] === 'undefined' || element <= par.val[1])
    });
  });
};

exports.filterContains = (resources, params) => {
  return resources.filter(rec => {
    return params.every(par => {
      const element = generateRoute(rec, par.rut, par.key) || '';
      return Array.isArray(element) ?
        par.val.every(item => element.some(a => normalizeStr(a) === normalizeStr(item))) :
        par.val.some(item => normalizeStr(element) === normalizeStr(item));
    });
  });
}

exports.methodSort = (resources, {prop, direction}) => {
  if (typeof prop === 'undefined') return resources;
  
  return resources.sort((a, b) => {
    let aVal = generateRoute(a, VALID_SORTS.find(val => val.key === prop).rut, prop),
      bVal = generateRoute(b, VALID_SORTS.find(val => val.key === prop).rut, prop);
    
    // Null values are sent to the end
    if (aVal === null) return 1;
    if (bVal === null) return -1;

    // Dates
    if (aVal.toString().indexOf('/') !== -1) {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    // Non numeric values (alphabetically)
    if (typeof aVal === 'string') {
      aVal = aVal.charCodeAt(0);
      bVal = bVal.charCodeAt(0);
    }
    
    return direction ? aVal - bVal : bVal - aVal;
  });
};

exports.methodPaginate = (resources, {page, forPage}) => {
  const pagFloor = Math.floor(page),
    forPageFloor = Math.floor(forPage);
  const section = page >= 1 ? forPageFloor * (pagFloor - 1) : 0;
  
  return resources.slice(section, section + forPageFloor);
};

exports.methodRoutes = (resources, req) => {
  for (let i = 0; i < resources.length; i++) {
    resources[i].photos = imageRoutes(resources[i].photos, req);
    resources[i].url = `https://${
      process.env.PROXY || req.headers.host + '/realestate/api'
    }/props/${
      resources[i].id
    }`
  };
  
  return resources;
};