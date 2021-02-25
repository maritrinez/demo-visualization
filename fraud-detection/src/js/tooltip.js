// Lib imports
import { select, selectAll } from 'd3-selection';
import { options, nice, parseTime } from './config';




export class Tooltip {
  constructor () {
    this._selector = undefined;
    this._dataBuilder = undefined;
  }


  // - - - CUSTOM PARAMETERS - - - //
  selector (_) {
    this._selector = _;
    return this;
  }

  dataBuilder (_) {
    this._dataBuilder = _;
    return this;
  }


  // - - - PUBLIC FUNCTIONS - - - //
  init() {
    this.render()
  }

  render() {
    const datum = this._dataBuilder.evolutionF();

    select(this._selector).select('.time')
      .html(nice.times(parseTime(options.time)))
    select(this._selector).select('.actual')
      .html(nice[options.measure](datum.get('actual')[0].count))
    select(this._selector).select('.historical')
      .html(`${nice[options.measure](datum.get('historical')[0].count)} historical`)
  }

  // - - - PRIVATE FUNCTIONS - - - //
  // 
  _privateFunction() {
    // this only will be used in this script
  }
}