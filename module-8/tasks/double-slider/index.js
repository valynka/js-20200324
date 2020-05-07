export default class DoubleSlider {
  element;
  subElements = {};

  onPointerDown = (event) => {
    this.dragging = event.target;

    event.preventDefault();

   this.shiftX = (this.dragging === this.subElements.thumbLeft) ? event.clientX - this.dragging.getBoundingClientRect().left
                  : this.dragging.getBoundingClientRect().right - event.clientX;
    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove = event => {
    const {left: sliderLeft, width} = this.subElements.inner.getBoundingClientRect();
    const pixInPercent = width / 100;

    if(this.dragging === this.subElements.thumbLeft){
      const right = parseFloat(this.subElements.thumbRight.style.right);
      let newLeft = (event.clientX - this.shiftX - sliderLeft) / pixInPercent;

      if(newLeft < 0){
        newLeft = 0;
      }
      if(newLeft + right > 100){
        newLeft = 100 - right;
      }

      
      this.dragging.style.left = newLeft + '%'; 
      this.subElements.progress.style.left = newLeft + '%'; 
      this.subElements.from.innerHTML = this.formatValue(this.getValue().from);    
    }
    else{
      const left = parseFloat(this.subElements.thumbLeft.style.left);
      
      let newRight = (width - (event.clientX - this.shiftX - sliderLeft)) / pixInPercent;
      
      if(newRight < 0){
        newRight = 0;
      }
      if(newRight +  left > 100){
        newRight = 100 - left;
      }

      this.dragging.style.right = newRight + '%';
      this.subElements.progress.style.right = newRight + '%';
      this.subElements.to.innerHTML = this.formatValue(this.getValue().to);
    }    
  }

  onPointerUp = (event) => {
    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.getValue(),
      bubbles: true
    }));
  }

  constructor ({
     min = 100,
     max = 200,
     formatValue = value => '$' + value,
     selected = {
       from: min,
       to: max
     }
   } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.render();
  }

  get template () {
    const {from, to} = this.selected;

    return `<div class="range-slider">
              <span data-element="from">${this.formatValue(from)}</span>
              <div data-element="inner" class="range-slider__inner">
                <span data-element="progress" class="range-slider__progress"></span>
                <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
                <span data-element="thumbRight" class="range-slider__thumb-right"></span>
              </div>
              <span data-element="to">${this.formatValue(to)}</span>
            </div>`
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.element.ondragstart = () => false;

    this.subElements = this.getSubElements(element);

    this.initEventListeners();

    this.update();  
  }

  initEventListeners () {
    this.subElements.thumbLeft.addEventListener('pointerdown', this.onPointerDown);
    this.subElements.thumbRight.addEventListener('pointerdown', this.onPointerDown);
  }  

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  update(){
    const rangeTotal = this.max - this.min;
    const left = Math.floor((this.selected.from - this.min) / rangeTotal * 100) + '%';
    const right = Math.floor((this.max - this.selected.to) / rangeTotal * 100) + '%';

    this.subElements.progress.style.left = left;
    this.subElements.progress.style.right = right;

    this.subElements.thumbLeft.style.left = left;
    this.subElements.thumbRight.style.right = right;
  }

  getValue(){
    const rangeTotal = this.max - this.min;
    const percentInUnit = rangeTotal / 100;
    const { left } = this.subElements.thumbLeft.style;
    const { right } = this.subElements.thumbRight.style;
    const from = Math.round(this.min + parseFloat(left) * percentInUnit);
    const to = Math.round(this.max - parseFloat(right) * percentInUnit);
    return {from, to};
  }  

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }
}
