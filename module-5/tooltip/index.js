class Tooltip {
  static instance;

  element;

  onMouseOver = event => {
    const element = event.target.closest('[data-tooltip]');

    if(element){
      this.render(element.dataset.tooltip);
      this.moveTooltip(event);

      document.addEventListener('pointermove', this.onMouseMove);
    }
  }

  onMouseMove = event => {
    this.moveTooltip(event);
  }

  onMouseOut = event => {
    this.removeTooltip();
  }

  removeTooltip(){
    if(this.element){
      this.element.remove();
      this.element = null;

      document.removeEventListener('pointermove', this.onMouseMove);
    }
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;

  }

  initEventListeners () {
    document.addEventListener('pointerover', this.onMouseOver);
    document.addEventListener('pointerout', this.onMouseOut);
  }

  initialize () {
    this.initEventListeners();
  }

  render (html) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;

    document.body.append(this.element);

  }

  moveTooltip(event){
    let left = event.clientX + 10;
    let top = event.clientY + 10;

    const rightBorder = document.documentElement.clientWidth - this.element.getBoundingClientRect().width - 10;
    const bottomBorder = document.documentElement.clientHeight - this.element.getBoundingClientRect().height - 10;

    
    if(left > rightBorder){
      left = rightBorder - 10;
    }

    if(top > bottomBorder){
      top = bottomBorder - 10;
    }

    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
  }

  destroy () {
    document.removeEventListener('pointerover', this.onMouseOver);
    document.removeEventListener('pointerout', this.onMouseOut);
    this.removeTooltip();
  }
}

const tooltip = new Tooltip();

export default tooltip;
