const ParcelFinder = require('./src/ParcelFinder')

if (process.argv.length < 3) {
  console.error('ERROR: A list of points is required in the form x1,y1, x2,y2');
  process.exit(1);
}

const points = process.argv.slice(2);

try {
  const perimeters = ParcelFinder.render(points);
  if (!perimeters.length) {
    console.log('There are no parcels defined');
  } else if (perimeters.length === 1) {
    console.log(`There is 1 parcel with a perimeter of ${perimeters[0]}`);
  } else {
    console.log(`There are ${perimeters.length} parcels with perimeters of ${perimeters.join(',')}`);
  }
} catch(err) {
  console.error('ERROR: %s', err.message);
}
process.exit(0);
