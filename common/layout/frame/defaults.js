const defaults = {

  field: null,
  bound: undefined,

  position: 'bottom left',

  reposition: true,

  format: 'YYYY-MM-DD',

  defaultDate: null,

  setDefaultDate: false,

  firstDay: 0,

  formatStrict: false,

  minDate: null,
  maxDate: null,

  yearRange: 10,

  showWeekNumber: false,

  minYear: 0,
  maxYear: 9999,
  minMonth: undefined,
  maxMonth: undefined,

  startRange: null,
  endRange: null,

  isRTL: false,

  yearSuffix: '',

  showMonthAfterYear: false,

  showDaysInNextAndPreviousMonths: false,

  numberOfMonths: 1,

  mainCalendar: 'left',

  container: undefined,

  i18n: {
    previousMonth : 'Previous Month',
    nextMonth     : 'Next Month',
    months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
    weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  },

  theme: null,

  onSelect: null,
  onOpen: null,
  onClose: null,
  onDraw: null,
};

export default defaults;

