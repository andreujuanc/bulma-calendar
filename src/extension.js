import datepicker_langs from './languages'
import './extension.sass'
 
Element.prototype.addEventsListener = function(events, listener = void 0) {
  if (!Array.isArray(events)) {
    events = [events];
  }

  events.forEach(event => {
    this.addEventListener(events, listener);
  });
}

//export default //MEHHHHH
module.exports = class datePicker {
  constructor(selector, options = {}) {
    // Determine click event depending on if we are on Touch device or not
    this._clickEvent = ['touchstart' , 'click'];

    this.element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    // An invalid selector or non-DOM node has been provided.
    if (!this.element) {
      throw new Error('An invalid selector or non-DOM node has been provided.');
    }

    /// Set default options and merge with instance defined
    this.options = Object.assign({}, {
      startDate: new Date(),
      minDate: null,
      maxDate: null,
      dateFormat: 'yyyy-mm-dd', // the default data format `field` value
      lang: 'en', // internationalization
      overlay: false,
      closeOnOverlayClick: true,
      closeOnSelect: true,
      // callback functions
      onSelect: null,
      onOpen: null,
      onClose: null,
      onRender: null
    }, options);

    // Initiate plugin
    this._init();
  }

  /**
   * Initiate plugin instance
   * @method _init
   * @return {datePicker} Current plugin instance
   */
  _init() {
    this._id = 'datePicker' + (new Date()).getTime() + Math.floor(Math.random() * Math.floor(9999));
    this.lang = typeof datepicker_langs[this.lang] !== 'undefined' ? this.lang : 'en';
    // Set the startDate to the input value
    if (this.element.value) {
      this.options.startDate = this._parseDate(this.element.value);
    }
    // Transform start date according to dateFormat option
    this.options.startDate = this._parseDate(this._getFormatedDate(this.options.startDate, this.options.dateFormat));

    if (this.options.minDate) {
      this.options.minDate = this._parseDate(this._getFormatedDate(this.options.minDate, this.options.dateFormat));
    }
    if (this.options.maxDate) {
      this.options.maxDate = this._parseDate(this._getFormatedDate(this.options.maxDate, this.options.dateFormat));
    }

    this.month = this.options.startDate.getMonth();
    this.year = this.options.startDate.getFullYear();
    this.day = this.options.startDate.getDate();
    this.open = false;

    this._build();
    this._bindEvents();

    return this;
  }

  /**
   * Build datePicker HTML component and append it to the DOM
   * @method _build
   * @return {datePicker} Current plugin instance
   */
  _build() {
    // Define datePicker Template
    const datePicker = `
      <div id='${this._id}' class="datepicker ${this.options.overlay ? 'modal' : ''}">
        ${this.options.overlay ? '<div class="modal-background"></div>' : ''}
        <div class="calendar">
          <div class="calendar-nav">
            <div class="calendar-nav-month">
              <button class="calendar-nav-previous-month button is-small is-text">
                <svg viewBox="0 0 50 80" xml:space="preserve">
                  <polyline fill="none" stroke-width=".5em" stroke-linecap="round" stroke-linejoin="round" points="45.63,75.8 0.375,38.087 45.63,0.375 "/>
                </svg>
              </button>
              <div class="calendar-month">${datepicker_langs[this.options.lang].months[this.month]}</div>
              <button class="calendar-nav-next-month button is-small is-text">
                <svg viewBox="0 0 50 80" xml:space="preserve">
                  <polyline fill="none" stroke-width=".5em" stroke-linecap="round" stroke-linejoin="round" points="0.375,0.375 45.63,38.087 0.375,75.8 "/>
              </button>
            </div>
            <div class="calendar-nav-day">
              <div class="calendar-day">${this.day}</div>
            </div>
            <div class="calendar-nav-year">
              <button class="calendar-nav-previous-year button is-small is-text">
                <svg viewBox="0 0 50 80" xml:space="preserve">
                  <polyline fill="none" stroke-width=".5em" stroke-linecap="round" stroke-linejoin="round" points="45.63,75.8 0.375,38.087 45.63,0.375 "/>
                </svg>
              </button>
              <div class="calendar-year">${this.year}</div>
              <button class="calendar-nav-next-year button is-small is-text">
                <svg viewBox="0 0 50 80" xml:space="preserve">
                  <polyline fill="none" stroke-width=".5em" stroke-linecap="round" stroke-linejoin="round" points="0.375,0.375 45.63,38.087 0.375,75.8 "/>
              </button>
            </div>
          </div>
          <div class="calendar-container">
            <div class="calendar-header">
              <div class="calendar-date">${this._getDayName(0, true)}</div>
              <div class="calendar-date">${this._getDayName(1, true)}</div>
              <div class="calendar-date">${this._getDayName(2, true)}</div>
              <div class="calendar-date">${this._getDayName(3, true)}</div>
              <div class="calendar-date">${this._getDayName(4, true)}</div>
              <div class="calendar-date">${this._getDayName(5, true)}</div>
              <div class="calendar-date">${this._getDayName(6, true)}</div>
            </div>
            <div class="calendar-body"></div>
          </div>
        </div>
      </div>
    `;

    // Add datepicker HTML element to Document Body
    document.body.insertAdjacentHTML('beforeend', datePicker);

    // Save pointer to each datePicker element for later use
    this.datePickerContainer = document.getElementById(this._id);
    this.datePickerCalendar = this.datePickerContainer.querySelector('.calendar');
    if (this.options.overlay) {
      this.datePickerOverlay = this.datePickerContainer.querySelector('.modal-background');
      this.datePickerCloseButton = this.datePickerContainer.querySelector('.modal-close');
    }
    this.datePickerCalendarNav = this.datePickerCalendar.querySelector('.calendar-nav');
    this.datePickerCalendarNavMonth = this.datePickerCalendar.querySelector('.calendar-month');
    this.datePickerCalendarNavYear = this.datePickerCalendar.querySelector('.calendar-year');
    this.datePickerCalendarNavDay = this.datePickerCalendar.querySelector('.calendar-day');
    this.datePickerCalendarNavPreviousMonth = this.datePickerCalendarNav.querySelector('.calendar-nav-previous-month');
    this.datePickerCalendarNavNextMonth = this.datePickerCalendarNav.querySelector('.calendar-nav-next-month');
    this.datePickerCalendarNavPreviousYear = this.datePickerCalendarNav.querySelector('.calendar-nav-previous-year');
    this.datePickerCalendarNavNextYear = this.datePickerCalendarNav.querySelector('.calendar-nav-next-year');
    this.datePickerCalendarHeader = this.datePickerCalendar.querySelector('.calendar-header');
    this.datePickerCalendarBody = this.datePickerCalendar.querySelector('.calendar-body');
  }

  /**
   * Bind all events
   * @method _bindEvents
   * @return {void}
   */
  _bindEvents() {
    // Bind event to element in order to display/hide datePicker on click
    this.element.addEventsListener(this._clickEvent, (e) => {
      e.preventDefault();

      if (this.open) {
        this.hide();
      } else {
        this.show();
      }
    });

    if (this.options.overlay) {
      // Bind close event on Close button
      if (this.datePickerCloseButton) {
        this.datePickerCloseButton.addEventsListener(this._clickEvent, (e) => {
          e.preventDefault();
          this.hide();
        });
      }
      // Bind close event on overlay based on options
      if (this.options.closeOnOverlayClick) {
        this.datePickerOverlay.addEventsListener(this._clickEvent, (e) => {
          e.preventDefault();
          this.hide();
        });
      }
    }

    // Bind year navigation events
    this.datePickerCalendarNavPreviousYear.addEventsListener(this._clickEvent, (e) => {
      e.preventDefault();
      this.prevYear();
    });
    this.datePickerCalendarNavNextYear.addEventsListener(this._clickEvent, (e) => {
      e.preventDefault();
      this.nextYear();
    });

    // Bind month navigation events
    this.datePickerCalendarNavPreviousMonth.addEventsListener(this._clickEvent, (e) => {
      e.preventDefault();
      this.prevMonth();
    });
    this.datePickerCalendarNavNextMonth.addEventsListener(this._clickEvent, (e) => {
      e.preventDefault();
      this.nextMonth();
    });
  }

  /**
   * Bind events on each Day item
   * @method _bindDaysEvents
   * @return {void}
   */
  _bindDaysEvents() {
    [].forEach.call(this.datePickerCalendarDays, (calendarDay) => {
      calendarDay.addEventsListener(this._clickEvent, (e) => {
        e.preventDefault();
        if (!e.currentTarget.classList.contains('is-disabled')) {
          let date = e.currentTarget.dataset.date.split('-');
          let [year, month, day] = date;
          if (typeof this.options.onSelect != 'undefined' &&
            this.options.onSelect != null &&
            this.options.onSelect) {
            this.options.onSelect(new Date(year, month, day));
          }
          this.element.value = this._getFormatedDate((new Date(year, month, day)), this.options.dateFormat);
          if (this.options.closeOnSelect) {
            this.hide();
          }
        }
      });
    });
  }

  /**
   * Get localized day name
   * @method renderDayName
   * @param  {[type]}      day          [description]
   * @param  {Boolean}     [abbr=false] [description]
   * @return {[type]}                   [description]
   */
  _getDayName(day, abbr = false) {
    day += datepicker_langs[this.options.lang].weekStart;
    while (day >= 7) {
      day -= 7;
    }

    return abbr ? datepicker_langs[this.options.lang].weekdaysShort[day] : datepicker_langs[this.options.lang].weekdays[day];
  }

  _renderDay(day, month, year, isSelected, isToday, isDisabled, isEmpty, isBetween, isSelectedIn, isSelectedOut) {
    return `
      <div data-date="${`${year}-${month}-${day}`}" class="calendar-date${isDisabled ? ' is-disabled' : ''}${isBetween ? ' calendar-range' : ''}${isSelectedIn ? ' calendar-range-start' : ''}${isSelectedOut ? ' calendar-range-end' : ''}">
        <button class="date-item${isToday ? ' is-today' : ''}${isSelected ? ' is-active' : ''}">${day}</button>
      </div>
    `;
  }

  _renderDays() {
    const now = new Date();
    let days = '';

    let numberOfDays = this._getDaysInMonth(this.year, this.month),
      before = new Date(this.year, this.month, 1).getDay();

    // Call onRender callback if defined
    if (typeof this.options.onRender != 'undefined' &&
      this.options.onRender != null &&
      this.options.onRender) {
      this.options.onRender(this);
    }

    // Get start day from options
    if (datepicker_langs[this.options.lang].weekStart > 0) {
      before -= datepicker_langs[this.options.lang].weekStart;
      if (before < 0) {
        before += 7;
      }
    }

    let cells = numberOfDays + before,
      after = cells;
    while (after > 7) {
      after -= 7;
    }

    cells += 7 - after;
    for (var i = 0; i < cells; i++) {
      var day = new Date(this.year, this.month, 1 + (i - before)),
        isBetween = false,
        isSelected = this._compareDates(day, this.options.startDate),
        isSelectedIn = false,
        isSelectedOut = false,
        isToday = this._compareDates(day, now),
        isEmpty = i < before || i >= (numberOfDays + before),
        isDisabled = false;

      day.setHours(0, 0, 0, 0);

      if (!isSelected) {
        isSelectedIn = false;
        isSelectedOut = false;
      }

      if (day.getMonth() !== this.month || (this.options.minDate &&
        (day.getTime() < this.options.minDate.getTime() || day.getTime() > this.options.maxDate.getTime()))) {
        isDisabled = true;
      }

      days += this._renderDay(day.getDate(), this.month, this.year, isSelected, isToday, isDisabled, isEmpty, isBetween, isSelectedIn, isSelectedOut);
    }

    this.datePickerCalendarBody.insertAdjacentHTML('beforeend', days);
    this.datePickerCalendarDays = this.datePickerCalendarBody.querySelectorAll('.calendar-date');
    this._bindDaysEvents();
  }

  /**
   * Navigate to the previous month and regenerate calendar
   * @method prevMonth
   * @return {void}
   */
  prevMonth() {
    this.month -= 1;
    this._refreshCalendar();
  }

  _disablePrevMonth() {
    this.datePickerCalendarNavPreviousMonth.setAttribute('disabled', 'disabled');
  }

  _enablePrevMonth() {
    this.datePickerCalendarNavPreviousMonth.removeAttribute('disabled');
  }

  /**
   * Navigate to the next month and regenerate calendar
   * @method nextMonth
   * @return {}
   */
  nextMonth() {
    this.month += 1;
    this._refreshCalendar();
  }

  _disableNextMonth() {
    this.datePickerCalendarNavNextMonth.setAttribute('disabled', 'disabled');
  }

  _enableNextMonth() {
    this.datePickerCalendarNavNextMonth.removeAttribute('disabled');
  }

  /**
   * Navigate to the previous year and regenerate calendar
   * @method prevYear
   * @return {void}
   */
  prevYear() {
    this.year -= 1;
    this._refreshCalendar();
  }

  _disablePrevYear() {
    this.datePickerCalendarNavPreviousYear.setAttribute('disabled', 'disabled');
  }

  _enablePrevYear() {
    this.datePickerCalendarNavPreviousYear.removeAttribute('disabled');
  }

  /**
   * Navigate to the previous year and regenerate calendar
   * @method nextYear
   * @return {}
   */
  nextYear() {
    this.year += 1;
    this._refreshCalendar();
  }

  _disableNextYear() {
    this.datePickerCalendarNavNextYear.setAttribute('disabled', 'disabled');
  }

  _enableNextYear() {
    this.datePickerCalendarNavNextYear.removeAttribute('disabled');
  }

  /**
   * Show datePicker HTML Component
   * @method show
   * @return {void}
   */
  show() {
    // Set the startDate to the input value
    if (this.element.value) {
      this.options.startDate = this._parseDate(this.element.value);
    }
    this.month = this.options.startDate.getMonth();
    this.year = this.options.startDate.getFullYear();
    this.day = this.options.startDate.getDate();
    this._refreshCalendar();

    if (typeof this.options.onOpen != 'undefined' &&
      this.options.onOpen != null &&
      this.options.onOpen) {
      this.options.onOpen(this);
    }

    this.datePickerContainer.classList.add('is-active');
    if (!this.options.overlay) {
      this._adjustPosition();
    }
    this.open = true;
  }

  /**
   * Hide datePicker HTML Component
   * @method hide
   * @return {void}
   */
  hide() {
    this.open = false;
    if (typeof this.options.onClose != 'undefined' &&
      this.options.onClose != null &&
      this.options.onClose) {
      this.options.onClose(this);
    }
    this.datePickerContainer.classList.remove('is-active');
  }

  /**
   * Refresh calendar with new year/month days
   * @method _refreshCalendar
   * @return {[type]}        [description]
   */
  _refreshCalendar() {
    if (this.month < 0) {
      this.year -= Math.ceil(Math.abs(this.month) / 12);
      this.month += 12;
    }
    if (this.month > 11) {
      this.year += Math.floor(Math.abs(this.month) / 12);
      this.month -= 12;
    }
    this.datePickerCalendarNavMonth.innerHTML = datepicker_langs[this.options.lang].months[this.month];
    this.datePickerCalendarNavYear.innerHTML = this.year;
    this.datePickerCalendarNavDay.innerHTML = this.day;
    this.datePickerCalendarBody.innerHTML = '';

    let minMonth = 0,
      minYear = 0,
      maxMonth = 12,
      maxYear = 9999;

    if (this.options.minDate) {
      minMonth = this.options.minDate.getMonth();
      minYear = this.options.minDate.getFullYear();
    }
    if (this.options.maxDate) {
      maxMonth = this.options.maxDate.getMonth();
      maxYear = this.options.maxDate.getFullYear();
    }

    if (this.year <= minYear) {
      this._disablePrevYear();
    } else {
      this._enablePrevYear();
    }

    if (this.year >= maxYear) {
      this._disableNextYear();
    } else {
      this._enableNextYear();
    }

    if (this.year <= minYear && this.month <= minMonth) {
      this._disablePrevMonth();
    } else {
      this._enablePrevMonth();
    }

    if (this.year >= maxYear && this.month >= maxMonth) {
      this._disableNextMonth();
    } else {
      this._enableNextMonth();
    }

    this._renderDays();
    return this;
  }

  /**
   * Recalculate calendar position
   * @method _adjustPosition
   * @return {void}
   */
  _adjustPosition() {
    var width = this.datePickerCalendar.offsetWidth,
      height = this.datePickerCalendar.offsetHeight,
      viewportWidth = window.innerWidth || document.documentElement.clientWidth,
      viewportHeight = window.innerHeight || document.documentElement.clientHeight,
      scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop,
      left, top, clientRect;

    if (typeof this.element.getBoundingClientRect === 'function') {
      clientRect = this.element.getBoundingClientRect();
      left = clientRect.left + window.pageXOffset;
      top = clientRect.bottom + window.pageYOffset;
    } else {
      left = this.element.offsetLeft;
      top = this.element.offsetTop + this.element.offsetHeight;
      while ((this.element = this.element.offsetParent)) {
        left += this.element.offsetLeft;
        top += this.element.offsetTop;
      }
    }

    this.datePickerCalendar.style.position = 'absolute';
    this.datePickerCalendar.style.left = left + 'px';
    this.datePickerCalendar.style.top = top + 'px';
  }

  /**
   * Destroy datePicker
   * @method destroy
   * @return {[type]} [description]
   */
  destroy() {
    this.datePickerCalendar.remove();
  }

  /**
   * Returns date according to passed format
   * @method _getFormatedDate
   * @param {Date}   dt     Date object
   * @param {String} format Format string
   *      d    - day of month
   *      dd   - 2-digits day of month
   *      D    - day of week
   *      m    - month number
   *      mm   - 2-digits month number
   *      M    - short month name
   *      MM   - full month name
   *      yy   - 2-digits year number
   *      yyyy - 4-digits year number
   */
  _getFormatedDate(dt, format) {
    var items = {
      d: dt.getDate(),
      dd: dt.getDate(),
      D: dt.getDay(),
      m: dt.getMonth() + 1,
      mm: dt.getMonth() + 1,
      M: dt.getMonth(),
      MM: dt.getMonth(),
      yy: dt.getFullYear().toString().substr(-2),
      yyyy: dt.getFullYear()
    };

    items.dd < 10 && (items.dd = '0' + items.dd);
    items.mm < 10 && (items.mm = '0' + items.mm);
    items.D = datepicker_langs[this.options.lang].weekdays[items.D ? items.D - 1 : 6];
    items.M = datepicker_langs[this.options.lang].monthsShort[items.M];
    items.MM = datepicker_langs[this.options.lang].months[items.MM];

    return format.replace(/(?:[dmM]{1,2}|D|yyyy|yy)/g, function(m) {
      return typeof items[m] !== 'undefined' ? items[m] : m;
    });
  }

  /**
   * Parse Date string based on the Date Format given
   * @method _parseDate
   * @param  {String}   dateString          Date string to parse
   * @param  {[String}   [format=undefined] Date Format
   * @return {Date}                         Date Object initialized with Date String based on the Date Format
   */
  _parseDate(dateString, format = undefined) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    if (!format) {
      format = this.options.dateFormat;
    }

    const formatPattern = /((?:mm?)|(?:dd?)|(?:yyy?y?))[^0-9]((?:mm?)|(?:dd?)|(?:yyy?y?))[^0-9]((?:mm?)|(?:dd?)|(?:yyy?y?))/i;
    const datePattern = /(\d+)[^0-9](\d+)[^0-9](\d+)/i;

    let matchFormat = formatPattern.exec(format);
    if (matchFormat) {
      let matchDate = datePattern.exec(dateString);
      if (matchDate) {
        switch(matchFormat[1][0]) {
          case 'd':
            date.setDate(matchDate[1]);
            break;
          case 'm':
            date.setMonth(matchDate[1] - 1);
            break;
          case 'y':
            date.setFullYear(matchDate[1]);
            break;
        }

        switch(matchFormat[2][0]) {
          case 'd':
            date.setDate(matchDate[2]);
            break;
          case 'm':
            date.setMonth(matchDate[2] - 1);
            break;
          case 'y':
            date.setFullYear(matchDate[2]);
            break;
        }

        switch(matchFormat[3][0]) {
          case 'd':
            date.setDate(matchDate[3]);
            break;
          case 'm':
            date.setMonth(matchDate[3] - 1);
            break;
          case 'y':
            date.setFullYear(matchDate[3]);
            break;
        }
      }
    }

    return date;
  }

  /**
   * Check if given year is LeapYear or not
   * @method _isLeapYear
   * @param  {Integer}   year Year to check
   * @return {Boolean}        True if LeapYear then False
   */
  _isLeapYear(year) {
    // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  }

  /**
   * Get the number of days in month
   * @method _getDaysInMonth
   * @param  {Integer}       year  Year to check if we are facing a leapyear or not
   * @param  {Integer}       month Month for which we want to know the amount of days
   * @return {Integer}              Days amount
   */
  _getDaysInMonth(year, month) {
    return [31, this._isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  }

  /**
   * Compare two dates
   * @method _compareDates
   * @param  {Date}     a First date to compare
   * @param  {Date}     b Second Date to compare with
   * @return {Boolean}    True if dates are equal then false
   */
  _compareDates(a, b) {
    // weak date comparison
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return a.getTime() === b.getTime();
  }
}


