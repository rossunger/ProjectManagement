export const getTextWidth = (() => {
  const container = document.createElement('canvas');

  return function (text='', element = document.body, backupRatio = 0.5) {
    let width = 0;    
    text = text.toString();

    let context = container.getContext('2d');

    if (context) {
      context.font = window
        .getComputedStyle(element)
        .getPropertyValue('font');
      width = context.measureText(text).width;
      
      return width;
    } else {            
      /* if something goes wrong mounting the canvas, return an estimate calculated using 
       * the backup ratio, the average open-sans font height-width ratio of 0.5 
       */
      let fontSize = parseFloat(
        window.getComputedStyle(element).getPropertyValue('font-size')
      );
      return fontSize * backupRatio * text.length;
    }
  };
})();