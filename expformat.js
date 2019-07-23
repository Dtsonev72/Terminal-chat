const gui=require('./guichat');
const colors = require('colors');

//function to print the expressions from the expression json
exports.printExpress=function(format,body,screen)
{
  //iterates through the objects
  for(let i=0;i<format.length;i++)
  { //outputs them to the chat client to see the expression and format
    gui.log((i+1)+'.Expression:'+format[i].expression+' style:'+format[i].style,body,screen)

  } 
  
}

//function to actually format the chat
exports.menuFormat=function(answer,format,body,screen){
      //conver the answer to a number as it is a char
      let count=Number(answer)-1;
      
      //gets the array of strings
      let numLines=body.getLines();
      
      //iterate through the chat
      for(let k=0;k<numLines.length;k++)
      {
      //if the string contains the expression
      if(numLines[k].includes(format[count].expression))
        { 
          //creates a new regular expression with the expression from the file and make it global
         let regex=new RegExp(format[count].expression, 'g');
         //we get a string where it is formatted by using evaluate function to run strings as code
         //this then replaces all of those instances of the expression and callse the style from the file
         let newstring=numLines[k].replace(regex,eval(`colors.${format[count].style}(format[count].expression)`));
        //then we just set the line at that index
         body.setLine(k,newstring);
        
        //we then render the screen
        screen.render();
       
        }
      }
    
 
      
     

}

//function to set the char at a specific index
exports.setCharAt=function(str,index,chr) {//gets the string index and char you want to set it to
    if(index > str.length-1) //if the index is bigger than the string 
    {
      return str;//return the string
    }
    //otherwise return the updated string
    return str.substr(0,index) + chr + str.substr(index+1);
  }
  