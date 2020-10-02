const expect  = require('chai').expect;
const ParcelFinder = require('../src/ParcelFinder');

const TYPE_ERROR_MSG = 'Point coordinates must be an array of strings in the form "x,y"';
const RANGE_ERROR_MSG = 'Point coordinates values must be in the range 0 to 99';

describe('ParcelFinder module', function () {
  it('it should return an empty array if no points are provided', () => {
    expect(ParcelFinder.render()).to.be.an('array').that.is.empty;
    expect(ParcelFinder.render([])).to.be.an('array').that.is.empty;
  });

  it('it should throw a TypeError if the input is not a string array of positive integer coordinates', () => {
    expect(() => ParcelFinder.render("0,0")).to.throw(TypeError, TYPE_ERROR_MSG);
    expect(() => ParcelFinder.render([0,0])).to.throw(TypeError, TYPE_ERROR_MSG);
    expect(() => ParcelFinder.render(['0 0'])).to.throw(TypeError, TYPE_ERROR_MSG);
    expect(() => ParcelFinder.render(['x,y'])).to.throw(TypeError, TYPE_ERROR_MSG);
    expect(() => ParcelFinder.render(['-1,0'])).to.throw(TypeError, TYPE_ERROR_MSG);
  });

  it('it should throw a RangeError if any coordinate is < 0 or >= 100', () => {
    expect(() => ParcelFinder.render(['100,0'])).to.throw(RangeError, RANGE_ERROR_MSG);
    expect(() => ParcelFinder.render(['0,100'])).to.throw(RangeError, RANGE_ERROR_MSG);
  });

  it('it should find 1 parcel with perimeter 4 given 1 point at the bottom left corner', () => {
    expect(ParcelFinder.render(['0,0'])).to.deep.equal([4]);
  });

  it('it should find 1 parcel with perimeter 4 given 1 point at the top right corner', () => {
    expect(ParcelFinder.render(['99,99'])).to.deep.equal([4]);
  });

  it('it should find 1 parcel with perimeter 4 given 1 point not at an edge', () => {
    expect(ParcelFinder.render(['5,5'])).to.deep.equal([4]);
  });

  it('it should find 2 parcels with perimeter 4 each given 2 points only diagonally connected', () => {
    expect(ParcelFinder.render(['3,3','5,5'])).to.deep.equal([4, 4]);
  });

  it('it should find 1 parcel with perimeter 8 given 3 connected points', () => {
    expect(ParcelFinder.render(['0,0','0,1','0,2'])).to.deep.equal([8]);
  });

  it('it should find 2 parcels with perimeters 8 and 4 given 3 connected points and a single point', () => {
    expect(ParcelFinder.render(['0,0','0,1','0,2','2,0'])).to.deep.equal([8,4]);
  });

  it('it should find 1 parcel with perimeter 8 given 3 connected points (not straight)', () => {
    expect(ParcelFinder.render(['0,0','0,1','1,1'])).to.deep.equal([8]);
  });

  it('it should find 1 parcel with perimeter 8 given 5 connected points in arch (open left)', () => {
    expect(ParcelFinder.render(['0,0','1,0','1,1','1,2','0,2'])).to.deep.equal([12]);
  });

  it('it should find 1 parcel with perimeter 14 given 6 connected points in a line', () => {
    expect(ParcelFinder.render(['0,0','0,1','0,2','0,3','0,4','0,5'])).to.deep.equal([14]);
  });

  it('it should find 1 parcel with perimeter 10 given 6 connected points in a rectangle', () => {
    expect(ParcelFinder.render(['0,0','0,1','0,2','1,0','1,1','1,2'])).to.deep.equal([10]);
  });

  it('it should find 1 parcel with perimeter 12 given 5 connected points in an arch', () => {
    expect(ParcelFinder.render(['0,0','0,1','1,1','2,1','2,0'])).to.deep.equal([12]);
  });
});

