export default class RangePicker {
  element;
  subElements = {};
  // TODO: rename "selectingFrom"
  selectingStart = true;
  selected = {
    from: new Date(),
    to: new Date()
  };

  
  onDocumentClick = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.close();
    }    
  }

  

  constructor({
    from = new Date(),
    to = new Date()} = {}
  ) {
    this.showDateFrom = new Date(from);
    this.selected = {from, to};

    this.render();
  }

  get template () {
    return `<div class="rangepicker">
             <div class="rangepicker__input" data-elem="input">
                <span data-elem="from">${RangePicker.formatDate(this.selected.from)}</span> -
                <span data-elem="to">${RangePicker.formatDate(this.selected.to)}</span>
              </div> 
              <div class="rangepicker__selector" data-elem="selector"></div> 
            </div>`;
  }

  static formatDate(date){
    return date.toLocaleString('ru', {dateStyle: 'short'});
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
  }

  getSubElements (element) {
    const subElements = {};

    for (const subElement of element.querySelectorAll('[data-elem]')) {
      subElements[subElement.dataset.elem] = subElement;
    }

    return subElements;
  }

  initEventListeners () {
    this.subElements.input.addEventListener('click', () => this.onInputClick());
    document.addEventListener('click', this.onDocumentClick, true);
    this.subElements.selector.addEventListener('click', event => this.onSelectorClick(event));
  }


  renderDateRangePicker(){
    const dateLeft = new Date(this.showDateFrom);
    const dateRight = new Date(this.showDateFrom);
    const { selector } = this.subElements;

    dateRight.setMonth(dateRight.getMonth() + 1);

    selector.innerHTML = ` 
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.renderCalendar(dateLeft)}
      ${this.renderCalendar(dateRight)}
    `
    const controlLeft = selector.querySelector('.rangepicker__selector-control-left');
    const controlRight = selector.querySelector('.rangepicker__selector-control-right');

    controlLeft.addEventListener('click', () => this.prev());
    controlRight.addEventListener('click', () => this.next());

    this.renderHighlight();
  }

  renderCalendar(showDate) {
    const date = new Date(showDate);
    date.setDate(1);
    const monthStr = date.toLocaleString('ru', {month: 'long'});   

    let day = date.getDay();
    if(day === 0) day = 7; 
    
    let table = `<div class="rangepicker__calendar">
                    <div class="rangepicker__month-indicator">
                      <time datetime="${monthStr}">${monthStr}</time>
                    </div>
                    <div class="rangepicker__day-of-week">
                        <div>Пн</div>
                        <div>Вт</div>
                        <div>Ср</div>
                        <div>Чт</div>
                        <div>Пт</div>
                        <div>Сб</div>
                        <div>Вс</div>
                    </div>
                    <div class="rangepicker__date-grid">
                      <button type="button" class="rangepicker__cell" data-value="${date.toISOString()}" style="--start-from: ${day}">${date.getDate()}</button>`

    date.setDate(2);

    while(date.getMonth() === showDate.getMonth()){
      table += `<button type="button" class="rangepicker__cell"
         data-value="${date.toISOString()}">${date.getDate()}</button>`;

      date.setDate(date.getDate() + 1);
    }

    table+= `</div></div>`;

     return table;
  }

  renderHighlight(){
    const {from, to} = this.selected;
    
    for(const date of this.element.querySelectorAll('[data-value]')){

      const value = date.dataset.value;

      date.classList.remove('rangepicker__selected-from');
      date.classList.remove('rangepicker__selected-between');
      date.classList.remove('rangepicker__selected-to');

      if(from && value === from.toISOString()){
        date.classList.add('rangepicker__selected-from');
      }
      else if(to && value === to.toISOString()){
        date.classList.add('rangepicker__selected-to');
      }
      else if(from && to && value > from.toISOString() && value < to.toISOString()){
        date.classList.add('rangepicker__selected-between');
      }
    }
  }

  
  onInputClick = event => {
    this.element.classList.toggle('rangepicker_open'); 
    this.renderDateRangePicker();  
  }

  onSelectorClick ({target}) {
       if(target.classList.contains('rangepicker__cell')){
      this.onRangepickerCellClick(target);
    }
  }

  prev () {
    this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
    this.renderDateRangePicker();
  }

  next () {
    this.showDateFrom.setMonth(this.showDateFrom.getMonth() + 1);
    this.renderDateRangePicker();
  }

  onRangepickerCellClick(cell){
    const { value } = cell.dataset;

    if(value) {
      const dateValue =  new Date(value);

      if(this.selectingStart) {
        this.selected = {
          from: dateValue,
          to: null
        };
        this.selectingStart = false;
        this.renderHighlight();
      }
      else {
        if(dateValue > this.selected.from){
          this.selected.to = dateValue;
        }
        else {
          this.selected.to = this.selected.from;
          this.selected.from = dateValue;          
        }

        this.selectingStart = true;
        this.renderHighlight();
      }
      if(this.selected.from && this.selected.to) {
        this.dispatchEvent();
        this.close();
        this.subElements.from.innerHTML = RangePicker.formatDate(this.selected.from);
        this.subElements.to.innerHTML = RangePicker.formatDate(this.selected.to)
      }
    }
  }

  dispatchEvent(){
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.selected
    }))
  }

  close(){
    this.element.classList.remove('rangepicker_open');
  }

  remove () {
    this.element.remove();
    document.removeEventListener('click', this.onDocumentClick, true);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.selectingStart = true;
    this.selected = {
      from: new Date(),
      to: new Date()
    };

    return this;
  }
}
