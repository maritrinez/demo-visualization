import { select } from 'd3-selection';
import { timeParse, timeFormat } from 'd3-time-format';
import {format} from "d3-format";

const parseTime = timeParse('%H:%M');

const nice = {
  times: timeFormat('%I:%M %p'),
  volume: format(',.0f'),
  amount: format('($,.0f'),
  amountLog: format('($,.2f'),
  percentage: format('(.1%')
}
const margin = {
  evo: { top: 10, right: 0, bottom: 20, left: 50 },
  grade: { top: 10, right: 10, bottom: 70, left: 60 },
  types: { top: 20, right: 50, bottom: 10, left: 0 }
};

const selectors = {
  evolution: '#evolution',
  tooltip: '#tooltip',
  grade: '#grade',
  type: '#type',
  details: '#details'
}

const options = {
  measure: 'volume',
  time: undefined,
  timeIndex: undefined
}

const size = {
  rect (selector) { return select(selector).node().getBoundingClientRect() },
  w (selector) { return this.rect(selector).width },
  h (selector) { return {
      evolution: this.w(selector) * 0.6,
      tooltip: this.w(selector) * 0.7,
      grade: this.w(selector) * 0.5,
      type: this.w(selector) * 0.65
    } 
  }
}

const colors = {
  azul: '#2372F5',
  naranja: '#F5A623',
  txtPrimary: '#444444',
  lightGrey:  '#eff1f2',
  midGrey: '#b8c1c7',
  darkGrey: '#64747E',
  severe: '#db240a',
  medium: '#f3c40b',
  low: '#c1db0a',
  tA: '#54f7ba',
  tB: '#54e3f7',
  tC: '#ba54f7',
  tD: '#e3f754'
}


export {
  parseTime,
  nice,
  selectors,
  options,
  size,
  colors,
  margin
};