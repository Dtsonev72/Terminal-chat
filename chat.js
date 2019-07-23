const WebSocket = require('ws');//library to connect to the server
const colors = require('colors');//changes the colors of output
const fs=require('fs');//to read the file
const expfmt=require('./expformat');//uses the formatting from the expressions
const gui=require('./guichat');//uses GUI elements
//gets the expression and the styles from the json file
let format=JSON.parse(fs.readFileSync('expression.json'));
//keep two variables to keep track of whispering and talking to previous 
let prevTo=null;
let prevKind=null;
let mouseClick=false;

// Adds all of the elements to the screen
gui.screen.append(gui.body);
gui.screen.append(gui.inputBar);
gui.screen.append(gui.userBox);
gui.screen.append(gui.userLabel);
gui.screen.append(gui.drawBox);
gui.screen.append(gui.drawLabel);
gui.inputBar.focus();//puts the focus on the text box

gui.fillBox(gui.drawBox);//Empties the drawing box to allow drawing

gui.screen.render();//renders the screen as it refreshes it

//initializes curr time to global scale
let currTime='';
setInterval(function(){
  //gets the date object
  const today=new Date();
  //gets the hours and minutes 
  currTime = today.getHours() + ":" + ('0'+today.getMinutes()).slice(-2);

},10);

// Close the example when user presses the escape key
gui.screen.key(['escape'], (ch, key) => (process.exit(0)));


// Handle submitting data and messages in the inputbar
gui.inputBar.on('submit', (text) => {
  //sends it to the outcommand function to handle the text
  outCommand(text);
  //clears the textbox
  gui.inputBar.clearValue();
  gui.inputBar.focus();//focuses the bar again
});

//everytime it is resized the drawbox is cleared
gui.drawBox.on('resize',function(){
  gui.fillBox(gui.drawBox);
});

//function to send the drawing in the chat
function sendDraw()
{
  //gets an array of strings from the drawing box
  let total=gui.drawBox.getLines();
  //a loop to iterate through the array
  for(let i=0;i<total.length;i++)
  { //sends the drawing to all
  
    //if the previous msg was a whisper
    if(prevKind==='direct'){
    //output to the box and send the message to the server to be handled
    gui.log(colors.magenta(' To ['+prevTo+']: ')+total[i],gui.body,gui.screen);
    socket.send(craftMessage(username,prevTo,prevKind,total[i]));
    }
    else 
    { //send to all if nothing previously stated
      socket.send(craftMessage(username,'all','chat',total[i]));
    }
  }
}

//an event for a mouse click
gui.drawBox.on('click', function() {
  //mouse click initialized as false first
  //whenever the box is clicked on it switches the variable mouseclick
  mouseClick=!mouseClick;
 
});

//an event for whenever the mouse moves
gui.drawBox.on('mousemove',function(mouse){
  //if the mouse hasn't been clicked then returns 
  if(mouseClick===false)
  return;
  //sets the draw symb as /
  let drawSymb='/';
  //here we get get the string at where your mouse is at
  let strComp=gui.drawBox.getLine(mouse.y);
  //we then set the char as / where ever your mouse is
  strComp=expfmt.setCharAt(strComp,mouse.x,drawSymb);
  //then we append and set that string line to the draw box
  gui.drawBox.setLine(mouse.y,strComp);
  //we then render the screen
  gui.screen.render();
  
  });
  

//function that converts objects to a string
const craftMessage = (from, to, kind, data) => JSON.stringify({
    from, to, kind, data,
  });


//arguments are taken from the command line
const username=process.argv[2];
const portnumber=process.argv[3];
const hostname=process.argv[4];
//creates the websocket based on those inputs
const socket=new WebSocket(`ws://${hostname}:${portnumber}/?username=${username}`);

//when the socket is on and receives a message it gets sent to the handlemessage function
socket.on( 'message' , (inputMessage) =>{
  //handles the message received
  handleMessage(inputMessage);
  //renders the screen
  gui.screen.render();
});

//when we open the socket
socket.on('open',function(){
  //we send a userlist command in order to get the userlist of the whole server
  socket.send(craftMessage(null,null,'userlist',null));
});

//sending a command to the server (Json)
function outCommand(cmdMessage){
  
    //initializes the 3 variables we would need to send
    let toMsg=null;
    let kindMsg=null;
    let dataMsg=null;
    //splits the message into an array based on the spaces
    let msgArray=cmdMessage.split(' ');
    gui.inputBar.clearValue();
    
  switch(true){
    //if /whis is found then it sends
    case /\/whis/.test(cmdMessage):
      //gets the first argument as the toMsg
      toMsg=msgArray[1];
      //initializes the previous person sent to as the To
      prevTo=msgArray[1];
      //the kind of msg
      prevKind='direct';
      //after the first two elemtns of the array it joins them to create one string
      dataMsg=msgArray.slice(2).join(' ');
      kindMsg='direct';//initializes the kind of message
      gui.log(currTime+colors.magenta(' To ['+toMsg+']: ')+dataMsg,gui.body,gui.screen);//outputs to the blessed box
      socket.send(craftMessage(username,toMsg,kindMsg,dataMsg));//sends the message to the socket
      break;

  //checks for the command who am i
    case /\/whoami/.test(cmdMessage):
        //just sends the kind of message as it doesn't require any other arguments
        kindMsg='whoami';
        socket.send(craftMessage(username,toMsg,kindMsg,dataMsg));
        break;

    case /\/userlist/.test(cmdMessage):
        //just sends the kind of message as it doesn't require any other arguments
        kindMsg='userlist';
        socket.send(craftMessage(username,toMsg,kindMsg,dataMsg));
        break;
    //checks the command for /chat
    case /\/chat/.test(cmdMessage):
        //makes the tomsg all  
        toMsg='all';
        //joins all with a space
        dataMsg=msgArray.slice(1).join(' ');
        //the kind of message
        kindMsg='chat';
        //keeps track of the prev kind of msg
        prevKind='chat';
        //sends it to the socket
        socket.send(craftMessage(username,toMsg,kindMsg,dataMsg));
        break;
    
    case /\/format/.test(cmdMessage):
        //only needs the first element of the array to
        //know which expression to use
        expfmt.menuFormat(msgArray[1],format,gui.body,gui.screen);
        break;
    //shows the expressions
    case /\/showexp/.test(cmdMessage):
        
        expfmt.printExpress(format,gui.body,gui.screen);
        break;
    
    case /\/clrchat/.test(cmdMessage):
        //sets the content to nothing in order to clear the chat
        gui.body.setContent('');
        gui.screen.render();
        break;
    //clears the drawing box
    case /\/clrdraw/.test(cmdMessage):
        gui.fillBox(gui.drawBox);//calls fillbox to clear it
        gui.screen.render();
    break;
    //send draw command
    case /\/senddraw/.test(cmdMessage):
        sendDraw();//sends the drawing 
        gui.screen.render();
    break;

    default:
        //this handles previous kind and to messages
        //if it was a whisper previously
        if(prevKind==='direct')
        { kindMsg='direct';//then we set kindMsg to direct
          dataMsg=cmdMessage;//and get the data
          toMsg=prevTo;//set the previous
          //print it on screen
          gui.log(currTime+colors.magenta(' To ['+toMsg+']: ')+dataMsg,gui.body,gui.screen);
        }
        //else if the previous was a chat or null
        else if(prevKind==='chat' || prevKind===null){
          //then sets the to message to all and kind of message to chat
          toMsg='all';
          dataMsg=msgArray.slice(0).join(' ');
          kindMsg='chat';
        }
        //sends the message to server
        socket.send(craftMessage(username,toMsg,kindMsg,dataMsg));
        break;
  
}
 
}

function handleMessage(strMessage) {
  // Check for Malformed JSON Objects
    let message;
    try {
      //parses the message as it is an object
      message = JSON.parse(strMessage);
    } catch (e) {
      //catches errors
      return;
    }
    //splits the data based on the spaces
    let msgArray=message.data.split(' ');
    
   
    // checks the message type
    switch (message.kind) {
      //if chat
      case 'chat':
        //prints with normal text 
        gui.log(currTime+' ['+message.from+'] '+message.data,gui.body,gui.screen);
        break;
      case 'userlist': 
        //if it is a userlist command
        let usrArray=message.data.split(',');//splits the data by the commas
        //sets the userbox to null
        gui.userBox.setContent('');
        //iterates through the array
        for(let i=0;i<usrArray.length;i++)
        { //I push the lines into the userlist box
          gui.userBox.pushLine(usrArray[i]);
        }
        //prints it on the screen as well
        gui.log(currTime+' '+colors.green('userlist: '+message.data),gui.body,gui.screen);
        break;
      case 'whoami': 
        //who am I command
        gui.log(currTime+' '+colors.green(message.data),gui.body,gui.screen);
      break;
      case 'direct':
        //if a whisper output it to the chat
        gui.log(currTime+' '+colors.magenta('From ['+message.from+']: ')+message.data,gui.body,gui.screen); 
      break;
      //if the message kind is a connection
      case 'connection':
      //test if joined
       if(/joined/.test(message.data))
       { //then push the username to the userlist box
         gui.userBox.pushLine(msgArray[0])
         
       }
       //test if left
       else if(/left/.test(message.data))
       { //iterate through the userbox
         for(let i=0;i<gui.userBox.getLines().length;i++)
         {  //find the one that matches
           if(msgArray[0]===gui.userBox.getLine(i))
           {  //then delete at that index
             gui.userBox.deleteLine(i);
           }
         }
         //render the screen
         screen.render();
       }
      
      gui.log(currTime+' '+colors.green(message.data),gui.body,gui.screen);
      break;
    
      default: 
        gui.log(currTime+' '+colors.green(message.data),gui.body,gui.screen);
    }

  }
