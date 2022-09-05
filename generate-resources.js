// Create new db.json. Simply run
// $ node generate-resources

// Modules
const fs = require('fs');
const path = require('path');

// Generation parameters
const parameters = {
  total: 600,
  proporcion: {
    apartment: 10,
    house: 8,
    store: 5,
    office: 2,
    field: 4,
    lot: 3,
    shed: 1
  },
  output: './db.json'
};

const quota = Object.create(Object, {
  generate: {
    value: function() {
      const entries = Object.entries(parameters.proporcion);
      Object.defineProperty(this, 'total', {
        value: entries.map(arr => arr[1]).reduce((a,b) => a + b),
        enumerable: false
      });
      let sobrantes = 0;
      for (i of entries) {
        this[i[0]] = Math.floor((parameters.total * i[1]) / this.total);
        sobrantes += this[i[0]];
      }
      this[entries[0][0]] += (parameters.total - sobrantes);
    },
    enumerable: false
  }
});


// Array where everything will be stored
const things = [];

// Base data
const 
  streets = [
    'Av. Velez Sarsfield',
    'Duarte Quirós',
    'Blvd. San Juan',
    'Luis María Drago',
    'Av. Marcelo T. de Alvear',
    'Catamarca',
    'Chubut',
    'Libertad',
    'San Martín',
    'La Tablada',
    'Inocente Cárcano',
    'Av. Gral. Paz',
    'Mariano Fragueiro',
    'Soldado Ruiz',
    'Constituyente San Salguero',
    'Av. Emilio Caraffa',
    'Octavio Pinto',
    'Mercedes de San Martín',
    'Gregorio Vélez',
    'Corro',
    'Angelo de Peredo',
    'Maestro Vidal',
    'Juan José Castro',
    'Luis Granneo',
    'Vélez',
    'Gregorio Luna y Cardenas',
    'Baradero'
  ],
  roads= [
    'Ruta Nacional 5',
    'Ruta Nacional 3',
    'Ruta Nacional 36',
    'Ruta Nacional 4',
    'Ruta Provincial 42',
    'Ruta Provincial 74',
    'Ruta Provincial 2',
    'Ruta Provincial 25',
    'Ruta Provincial 6'
  ],
  types = [
    'apartment',
    'house',
    'store',
    'office',
    'field',
    'lot',
    'shed'
  ],
  amenities = {
    house: [
      'Furnished',
      'Closed Neighbourhood',
      'Water Heater',
      'Chimney',
      'Garage',
      'Kitchen',
      'Laundry',
      'Pool',
      'Backyard',
      'Basement'
    ],
    apartment: [
      'Furnished',
      'Elevator',
      'Balcony',
      'Water Heater',
      'Garage',
      'Kitchen',
      'Laundry',
      'Pool'
    ]
  },

  // PHOTOS -----------------------------------------------------------
  photos = {
    apartmentExterior: [
      'ApartmentExterior1',
      'ApartmentExterior2',
      'ApartmentExterior3',
      'ApartmentExterior4',
      'ApartmentExterior5'
    ],
    houseExterior: [
      'HouseExterior1',
      'HouseExterior2',
      'HouseExterior3',
      'HouseExterior4',
      'HouseExterior5'
    ],
    officeExterior: [
      'OfficeExterior1',
      'OfficeExterior2',
      'OfficeExterior3'
    ],
    storeExterior: [
      'StoreExterior1',
      'StoreExterior2',
      'StoreExterior3'
    ],
    bathroom: [
      'Bathroom1',
      'Bathroom2',
      'Bathroom3',
      'Bathroom4',
      'Bathroom5'
    ],
    bedroom: [
      'Bedroom1',
      'Bedroom2',
      'Bedroom3',
      'Bedroom4',
      'Bedroom5'
    ],
    kitchen: [
      'Kitchen1',
      'Kitchen2'
    ],
    livingroom: [
      'Livingroom1',
      'Livingroom2'
    ],
    dinner: [
      'Dinner1',
      'Dinner2'
    ],
    amenities: [
      'Balcony',
      'Closed-neighbourhood',
      'Garage',
      'Laundry',
      'Pool',
      'Backyard',
      'Basement'
    ],
    interioroffice: [
      'InteriorOffice1',
      'InteriorOffice2',
      'InteriorOffice3'
    ],
    lot: [
      'Lot1',
      'Lot2',
      'Lot3'
    ],
    shed: [
      'Shed1',
      'Shed2',
      'Shed3'
    ],
    field: [
      'Field1',
      'Field2',
      'Field3'
    ]
  };

// Helper functions
const rand = (n1, n2) => {
  // A. "Optional" first argument
  // rand(4) = rand(0, 4)
  // rand(2, 4) = rand(2, 4)

  // B. Order of arguments is irrelevant
  // rand(0, 10) = range between 0 and 10
  // rand(15, 7) = range between 7 and 15
  let min = typeof n2 === 'number' ? Math.min(n1, n2) : 0;
  let max = Math.max(n2, n1 || 0) || n1;

  return min + Math.round(Math.random() * (max - min));
};
const clamp = (n, min, max) => Math.max(Math.min(n, max), min);
const cleanTildes = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(' ', '');

// Generation functions
const generate = {
  address: (type) => type === 'field' ? `${roads[rand(roads.length - 1)]} km. ${rand(2000)}` : `${streets[rand(streets.length - 1)]} ${rand(1300)}`,
  type: () => {
    let type = types[rand(types.length - 1)];
    if (quota[type] <= 0) type = types[Object.values(quota).findIndex(x => x !== 0)];
    quota[type]--;
    return type||'apartment';
  },
  apartment: () => `${rand(20)}º ${['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][rand(7)]}`,
  operation: () => ['buy', 'rent'][rand(2)],
  stories: () => rand(1, 4),
  bathrooms: (type, stories) => (type === 'house' ? rand(1, 4) : 1) + stories,
  bedrooms: (type, stories) => (type === 'house' ? rand(1, 5) : 1) + stories,
  area: (type, stories) => type !== 'field' && type !== 'lot' ? (type === 'house' ? (rand(40, 90)) : (rand(40, 110))) * stories : null,
  hectares: (type) => {
    if (type === 'lot') return (rand(5, 40) * .0625 * .1).toFixed(4);
    else if (type === 'field') return rand(2, 24) * .9;
    else return null;
  },
  built: () => new Date(rand(1996, 2018), rand(12), rand(28)),
  timeMarket: built => {
    const date1 = new Date(rand(2009, 2019), 1, 1);
    if (built === null) return date1;
    const dates = [date1, built]
      .sort((a, b) => a.getFullYear() - b.getFullYear());
    return dates[0];
  },
  currency: operation => rand(10) < (2 + (operation === 'buy' ? 6 : 0)) ? 'USD' : 'ARS',
  price: (operation, currency, stories, bedrooms, type, hectaresField, amenities) => {
    let price;
    switch(type){
      case 'apartment':
        price = 120;
        break;
      case 'house':
        price = 400;
        break;
      case 'store':
        price = 200;
        break;
      case 'office':
        price = 300;
        break;
      case 'shed':
        price = 300;
        break;
      case 'lot':
        price = (20000 + rand(20000)) * hectaresField;
        break;
      case 'field':
        price = (1000 + rand(4000)) * hectaresField;
        break;
      default:
        price = 300;
    }
    if (bedrooms) price += bedrooms * 600;
    if (stories) price *= 12;
    if (amenities) price += 75 * amenities.length;
    if (currency === 'ARS') price *= 30;
    if (operation === 'buy' && type !== 'lot' && type !== 'field') price *= 12;
    return Math.floor(price*.01)*100;
  },
  amenities: type => amenities[type].filter(() => rand(10) < 4),
  expenses: (price) => Math.min(rand(price * .25), Math.floor(rand(50)) * 100),
  photos: (id, type, bathrooms, bedrooms) => {
    const arr = [];
    switch (type) {
      case 'apartment':
        arr.push(photos.apartmentExterior[id % photos.apartmentExterior.length]);
        amenities[type].forEach(amenity => {
          amenity !== 'kitchen' ?
            arr.push(cleanTildes(amenity)) :
            arr.push(photos.kitchen[rand(photos.kitchen.length - 1)]);
        });
        break;
      case 'house':
        arr.push(photos.houseExterior[id % photos.houseExterior.length]);
        amenities[type].forEach(amenity => {
          amenity!=='kitchen'?
            arr.push(cleanTildes(amenity)) :
            arr.push(photos.kitchen[rand(photos.kitchen.length - 1)]);
        });
        break;
      case 'store':
        arr.push(photos.storeExterior[id % photos.storeExterior.length]);
        break;
      case 'office':
        arr.push(photos.officeExterior[id % photos.officeExterior.length]);
        break;
      case 'shed':
        arr.push(photos.shed[id % photos.shed.length]);
        break;
      case 'lot':
        arr.push(photos.lot[id % photos.lot.length]);
        break;
      case 'field':
        arr.push(photos.field[id % photos.field.length]);
        break;
    }
    for (let i = 0; i < bathrooms; i++) arr.push(photos.bathroom[rand(photos.bathroom.length - 1)]);
    for (let i = 0; i < bedrooms; i++) arr.push(photos.bedroom[rand(photos.bedroom.length - 1)]);
    return arr.map(item => item + '.jpg');
  },
  added: timeMarket => `${timeMarket.getDate()}/${timeMarket.getDate() + 1}/${clamp(timeMarket.getFullYear(), 2009, 2017) + rand(2)}`,
  edited: added => {
    if (rand(10) > 7) {
      const [d, m, y] = added.split('/');
      return `${Math.min(parseInt(d) + rand(-2, 2), 28)}/${Math.min(parseInt(m) + rand(-2, 2), 12)}/${Math.min(parseInt(y) + rand(-2, 5), 2019)}`;
    } else {
      return added;
    }
  }
};

// Create elements
(function() {
  quota.generate();
  
  for (let i = 0; i < parameters.total; i++) {
    things.push((() => {
      const
        id = i + 1,
        type = generate.type(),
        address = generate.address(type),
        apartment = type === 'apartment' ? generate.apartment() : null,
        floor = type === 'apartment' ? rand(20) : null,
        operation = type === 'lot' || type === 'field' ? 'buy' : generate.operation(),
        stories = type !== 'field' && type !== 'lot' ? generate.stories() : null,
        bathrooms = type === 'house' || type === 'apartment' || type === 'office' ? generate.bathrooms(type, stories) : null,
        bedrooms = type === 'house' || type === 'apartment' ? generate.bedrooms(type, stories) : null,
        area = generate.area(type, stories),
        hectaresField = generate.hectares(type),
        built = type !== 'lot' && type !== 'field' ? generate.built() : null,
        timeMarket = generate.timeMarket(built),
        currency = generate.currency(operation),
        amenities = type === 'house' || type === 'apartment' ? generate.amenities(type) : null,
        price = generate.price(operation, currency, stories, bedrooms, type, hectaresField, amenities),
        expenses = type === 'apartment' ? generate.expenses(price) : null,
        photos = generate.photos(id, type, bathrooms, bedrooms),
        added = generate.added(timeMarket),
        edited = generate.edited(added);
      
      return {
        id: id,
        type: type,
        address: address,
        apartment: apartment,
        floor: floor,
        operation: operation,
        built: built !== null ? built.getFullYear() : null,
        timeMarketDays: Math.floor((new Date().getTime() - timeMarket.getTime()) / (1000 * 3600 * 24)),
        prices: {
          currency: currency,
          price: price,
          expenses: expenses
        },
        spaces: {
          bathrooms: bathrooms,
          bedrooms: bedrooms,
          stories: stories,
          area: area,
          hectaresField: hectaresField
        },
        amenities: amenities,
        photos: photos,
        url: `/properties/${id}`,
        added: added,
        edited: edited
      }
    })());
  }
})();

Object.preventExtensions(things);

fs.writeFile(parameters.output, JSON.stringify(things), err => {
  try{
    if (err) throw err;
    console.log(`File "${path.resolve(parameters.output)}" was generated successfuly`);
    console.log(`Archivo "${path.resolve(parameters.output)}" generado con éxito`);
  } catch (e) {
    console.error(`There has been an error writing the file "${path.resolve(parameters.output)}": `, e);
    console.error(`Se ha generado un error al escribir el archivo "${path.resolve(parameters.output)}": `, e);
  }
});