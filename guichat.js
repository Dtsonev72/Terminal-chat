const blessed = require('blessed');

//screen that we use in the terminal
exports.screen = blessed.screen({
    fastCSR: true,
    mouse:true//alows mouse integration
  
  });
  //creates a body where the chat will be outputted
exports.body = blessed.box({
    //location and the dimensions of it
    top: 0,
    right: 0,
    height: '100%-1',
    width: '70%',
    //allows the mouse and keys input
    keys: true,
    mouse: true,
    //scrollable for any lines that continue down
    alwaysScroll: true,
    scrollable: true,
    //color of the scrollbar
    scrollbar: {
      ch: ' ',
      bg: 'red'
    }
  });
  //creates a box where to actually draw 
exports.drawBox = blessed.box({
    //dimensions and position
    top: 0,
    left: 0,
    height: '51%-1',
    width: '30%',
    //allows mouse actions
    mouse: true,
    //foreground and background
    style: {
      bg: 'white',
      fg:'black'
    }
  });
  //this is just the label on top of the drawbox
exports.drawLabel=blessed.box({
    //dimensions and position
    top: 0,
    left: 0, 
    height: '5%',
    width: '30%',
    //puts text in the middle with content of draw box
    align:'center',
    content:'Draw Box',
    style:{
      bg:'red'
    }
  });
  
  //creates a blessed textbox object which takes in the input of strings
exports.inputBar = blessed.textbox({
    //position and dimensions
    bottom: 0,
   right: 0,
    height: 1,
    width: '71%',
    //takes in key inputs, but not mouse inputs
    keys: true,
    mouse: false,
    //doesn't blink or scroll
    blink:false,
    scrollable:false,
    //focuses on the element on input
    inputOnFocus: true,
    style: {
      fg: 'white',
      bg: 'blue'
      
    }
  });
  //a label for the userlist box
exports.userLabel=blessed.box({
    //position and dimensions
    top: '49%',
    left: 0,
    height: '5%',
    width: '30%',
    //center the text userlist
    align:'center',
    content:'Userlist',
  
    style:{
      bg:'cyan'
    }
    
  });
  //this is where the userlist is outputted
exports.userBox = blessed.box({
    //position and dimensions
    top: '50%',
    left: 0,
    height: '50%',
    width: '30%',
    //alows mouse events and makes it a scrollable box to see all users
    mouse: true,
    scrollable: true,
    style:{
      scrollbar: {
        ch: ' ',
        bg: 'red'
      },
      bg:'green',
      
    }
  });

//fills the drawing box with spaces in order to be able to draw
exports.fillBox=function(drawBox)
{ 
  //sets the content to null
  drawBox.setContent('');
  //gets a string of spaces
  let strFill=" ";
  //iterates through the draw box width
  for(let k=0;k<drawBox.width-1;k++)
  { //adds that many spaces
    strFill=" "+strFill;
  }
  //then iterates through the height
  for(let i=0;i<drawBox.height;i++)
  {
    //we would push all those string spaces to the box
    drawBox.pushLine(strFill);
  }
}

// Add text to the body of the chat
exports.log = (text,body,screen) => {
    // let found=null;
     //if the total lines are under 25
     if(body.getLines().length<25)
     {//we continually push the text
     body.pushLine(text);
     }
     //if not 
     else 
     {
       //we delete the top and push a line from the bottom
       body.deleteTop();
       body.pushLine(text);
     }
   
     //the screen renders
     screen.render();
   }
   