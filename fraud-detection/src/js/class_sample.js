// Lib imports
import { select, selectAll } from 'd3-selection';




// Constants
const constant = 56;


export class Layout {
  constructor () {
    this._container = undefined;
  }


  // - - - CUSTOM PARAMETERS - - - //
  container (_) {
    this._container = _;
    return this;
  }


  // - - - PUBLIC FUNCTIONS - - - //
  build() {
    // Call this function from another file
    // where this class is imported
    // and created a new Class ()
    select(this._container)
      .append('h2')
      .html('este es un h2');
  }


  // - - - PRIVATE FUNCTIONS - - - //
  // 
  _privateFunction() {
    // this only will be used in this script
  }
}