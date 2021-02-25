// Lib imports
import { select, selectAll } from 'd3-selection';
import { groups, group, extent, max } from 'd3-array';
import { scaleOrdinal, scaleLinear, scaleTime, scaleBand } from 'd3-scale';
import { stack, pie } from 'd3-shape';


import { html } from "gridjs";


// Script imports
import { selectors, size, options, margin, colors, parseTime, nice } from './config';


export class DataBuilder {
  constructor () {
    this._data = undefined;
  }


  // - - - CUSTOM PARAMETERS - - - //
  data (_) {
    this._data = _;
    return this;
  }


  // - - - PUBLIC FUNCTIONS - - - //
  init() {
    // set time
    options.timeIndex = options.timeIndex || 0;
    options.time = options.time || this._uniqueTimes()[0];
    
    // parse times
    Object.keys(this._data).forEach(k => {
      if (this._data[k].length != undefined) {
        this._data[k].forEach(d => d.timeDate = parseTime(d.time));
      } else {
        Object.keys(this._data[k]).forEach(j => {
          this._data[k][j].forEach(d => d.timeDate = parseTime(d.time));
        });
      }
    });

    // pie generator
    this._pie = pie()
      .padAngle(0.005)
      .sort(null)
      .value(d => +d.count)
  }

  evolution() {    
    // group data to render line chart
    return groups(this._completeEvolution()[options.measure], d => d.observed);
  }

  evolutionF() {
    return group(this.timeData().evolution[options.measure], d => d.observed);
  }

  gradeF() {
    // update x scale domain
    this._gradeXscl().domain([0, max(this._stackGrade(), d => max(d, d => d[1]))])
    return this._stackGrade().map(d => {
      d.forEach(v => {
        v.x = this._gradeXscl()(v[0]);
        v.y = this._gradeYscl()(v.data.observed);
        v.width = this._gradeXscl()(v[1]) - this._gradeXscl()(v[0]);
        v.height = this._gradeYscl().bandwidth();
        v.value = nice[options.measure](v.data[v.key]);
      })
      d.color = this._gradesColor()(d.key);
      return d;
    });
  }

  typeF() {
    return this._pie(this.timeData().type).map(d => {
      d.color = this._typesColor()(d.data.type);
      d.niceValue = nice['volume'](d.value)
      return d;
    })
  }

  detailsF() {

    // const data = this.timeData().details.map(d => {
    //   return {
    //     'ID': d.account_id,
    //     'Fraud type': d.fraud_type,
    //     'Fraud score': d.fraud_score,
    //     'Transaction amount': nice['amount'](d.transaction_amount),
    //     'Details': `<a href=${d.details} target="_blank">${d.details}</a>`
    //   }
    // });
    // columns
    const c = [{
       id: 'time_stamp',
       name: 'Time stamp'
    }, {
       id: 'account_id',
       name: 'ID'
    }, {
       id: 'fraud_type',
       name: 'Fraud type'
    }, {
       id: 'fraud_score',
       name: 'Fraud score'
    }, {
       id: 'transaction_amount',
       name: 'Transaction amount'
    }, {
       id: 'details',
       name: 'See full log'
       // formatter: (_, row) => html(`<a href=${row.cells[5].data} target="_blank">${row.cells[5].data}</a>`)
    }];

    const data = this.timeData().details.map(d => {
      return {
        'time_stamp': d.time_stamp,
        'account_id': d.account_id,
        'fraud_type': d.fraud_type,
        'fraud_score': d.fraud_score,
        'transaction_amount': nice['amountLog'](d.transaction_amount),
        'details': d.details
        // 'details': `${html(}<a href=${d.details} target="_blank">${d.details}</a>${)}`
      }
    });

  //   columns: [{
  //      id: 'name',
  //      name: 'Name'
  //   }, {
  //      id: 'email',
  //      name: 'Email'
  //   }, {
  //      id: 'phoneNumber',
  //      name: 'Phone Number'
  //   }],
  // data: [
  //   { name: 'John', email: 'john@example.com', phoneNumber: '(353) 01 222 3333' },
  //   { name: 'Mark', email: 'mark@gmail.com', phoneNumber: '(01) 22 888 4444' },
  // ]


    return {
        columns: c,
        data: data
      }
  }

  timeData() {
    // de momento sólo viene del mouseover/out
    // sólo cuando cambia el time
    const result = {};
    Object.keys(this._data).forEach(k => {
      if (this._data[k].length != undefined) {
        result[k] = this._data[k].filter(d => d.time == options.time);
      } else {
        result[k] = {};
        Object.keys(this._data[k]).forEach(j => {
          result[k][j] = this._data[k][j].filter(d => d.time == options.time);
        });
      }
    });
    return result;
  }

  // - - - PRIVATE FUNCTIONS - - - //
  // - - complete data
  _completeEvolution () {
    return this._Completeevolution || buildCompleteEvolution(this);
    function buildCompleteEvolution(that) {
      // constants
      const data = that._data.evolution,
            xScl = that._evoXscl(),
            yScl = that._evoYscl(),
            cScl = that._seriesColor(),
            name = 'ana'

      _setEvoCoordinates('amount')
      _setEvoCoordinates('volume')

      const result = data;
      that._Completeevolution = result;
      return result;

      function _setEvoCoordinates(measure) {
        const scl = yScl[measure];
        for (let i = 0; i < data[measure].length; i++) {
          const a = data[measure][i];
          a.x = xScl(a.timeDate)
          a.y = scl(+a.count)
          a.y0 = scl.range()[0]
          a.color = cScl(a.observed)
        }
      }
    } 
  }
  
  _stackGrade() {
    // grade & type data are always filtered
    const data = this.timeData().risk[options.measure];
     return stack()
      .keys(['severe', 'medium', 'low'])
      (data)
      .map(d => (d.forEach(v => v.key = d.key), d));
  }
  // - - reducers (mostly scales domains)
  _uniqueTimes () {
    return this._uniquetimes || buildTimes(this);
    function buildTimes(that) {
      const result = that._unique(that._data.evolution.amount, 'time');
      that._uniquetimes = result;
      return result;
    } 
  }
  
  _timeDomain() {
    return this._timedomain || build_timeDomain(this);
    function build_timeDomain(that) {
      const result = extent(that._data.evolution.amount, d => d.timeDate);
      that._timedomain = result;
      return result;
    }       
  }

  _amountDomain() {
    return this._amountdomain || build_amountDomain(this);
    function build_amountDomain(that) {
      const result = [0, max(that._data.evolution.amount, d => +d.count)]
      that._amountdomain = result;
      return result;
    }       
  }

  _volumeDomain() {
    return this._volumedomain || build_volumeDomain(this);
    function build_volumeDomain(that) {
      const result = [0, max(that._data.evolution.volume, d => +d.count)]
      that._volumedomain = result;
      return result;
    }       
  }

  _evolutionSeries() {
    return this._evolutionseries || buildevolutionSeries(this);
    function buildevolutionSeries(that) {
      const result = that._unique(that._data.evolution.amount, 'observed');
      that._evolutionseries = result;
      return result;
    } 
  }

  _riskGrades() {
    return this._riskgrades || buildriskGrades(this);
    function buildriskGrades(that) {
      const result = that._unique(that._data.risk.amount, 'grade');
      that._riskgrades = result;
      return result;
    } 
  }
  
  _fraudTypes() {
    return this._fraudtypes || buildFraudTypes(this);
    function buildFraudTypes(that) {
      const result = that._unique(that._data.type, 'type');
      that._fraudtypes = result;
      return result;
    } 
  }
  
  // - - scales
  // evolution
  _evoXscl() {  
      // time
      // domain: el extent del time
      // range: la anchura disponible
      return scaleTime()
        .domain(this._timeDomain())
        .range([margin.evo.left, size.w(selectors.evolution) - margin.evo.right])
  }

  _evoYscl() {  
    return this._evoyscl || setEvoYscl(this);
    
    function setEvoYscl(that) {
      // linear
      // domain: el extent de los valores (amount o volume)
        // en principio lo actualizo cuando saque las coordenadas de los datos
      // range: height del small, margin.evo top

      const scl = scaleLinear()
        .range([size.h(selectors.evolution).evolution - margin.evo.bottom, margin.evo.top])

      const result = {
        volume: scl.copy().domain(that._volumeDomain()),
        amount: scl.copy().domain(that._amountDomain())
      }
      that._evoyscl = result;
      return result;
    }
  }
  
  _seriesColor() {
    return this._seriescolor || setSeriesColor(this);
    
    function setSeriesColor(that) {
      // ordinal
      // domain: las series
      // range: colores, azul y naranja

      const result = scaleOrdinal()
        .domain(that._evolutionSeries()) 
        .range([colors.naranja, colors.azul])

      that._seriescolor = result;
      return result;
    }
  }
  // stacked
  _gradeXscl() {  
    return this._gradexscl || setgradeXscl(this);
    
    function setgradeXscl(that) {
      // time
      // domain: el extent del time
      // range: la anchura disponible
      const result = scaleLinear()
        .domain([0, max(that._stackGrade(), d => max(d, d => d[1]))])
        .range([margin.grade.left, size.w(selectors.grade) - margin.grade.right])

      that._gradexscl = result;
      return result;
    }
  }

  _gradeYscl() {  
    return this._gradeyscl || setgradeYscl(this);
    
    function setgradeYscl(that) {
      // time
      // domain: el extent del time
      // range: la anchura disponible
      const result = scaleBand()
        .domain(that._evolutionSeries())
        .range([size.h(selectors.grade).grade - margin.grade.bottom, margin.grade.top])
        .padding(0.3);

      that._gradeyscl = result;
      return result;
    }
  }

  _gradesColor() {
    return this._gradescolor || setGradesColor(this);
    
    function setGradesColor(that) {
      // ordinal
      // domain: las series
      // range: colores de los grados
      const result = scaleOrdinal()
        .domain(['severe', 'medium', 'low']) 
        .range([colors.severe, colors.medium, colors.low])

      that._gradescolor = result;
      return result;
    }
  }
  
  _typesColor() {
    return this._typescolor || settypesColor(this);
    
    function settypesColor(that) {
      // ordinal
      // domain: las series
      // range: colores de los grados
      const result = scaleOrdinal()
        .domain(that._fraudTypes()) 
        .range([colors.tA, colors.tB, colors.tC, colors.tD])

      that._typescolor = result;
      return result;
    }
  }
    
    // x, tothink
    // y, band, historiacal, actual
    // color, risk grades low, mid, high

  // stacked
    // circular, tothink
    // color, types
  
  // - - helpers
  _unique(data, clave) {
    return groups(data, d => d[clave]).map(d => d[0])
  }

  _privateFunction() {
    // this only will be used in this script
  }
}