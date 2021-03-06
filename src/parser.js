// THIS ONLY WORKS WHEN USING NODE ON THIS FILE
// import request from "request";

// THIS ONLY WORKS WHEN RUNNING TESTS
const request = require('request');

//Defining the CalendarEvent class
class CalendarEvent{
    title = "";
    
    //Four digit format
    year = 0;
    
    //Two digit format, so January 7th is 01 for the month and 07 for the day
    month = "";
    day = 0;
    
    //24 hour format to avoid handling of AM/PM
    hour = 0;
    minute = 0;
    
    c = "";
    description = "";
    link = "";

    //AKA Office Hours, Class, Assignment, Exam, Quiz, etc.
    type = "";

    //Additional backend info for differentiating events
    uid = "";

    constructor(){
    
    }

    reset(){
        this.title = "";
        this.c = "";
        this.type = "";
        this.description = ""; //Prob not doable anymore due to incredibly high amounts of gibberish
        this.link = "";
        this.uid = ""; //Probabily irrelevant now
        this.year = 0;
        this.month = "";
        this.day = 0;

        this.hour = 0;
        this.minute = 0;
    }
}

//Generic parsing from a string into an array
function parse(dataString, events_arr){
    
    //Create new calendar event
    let newEvent = new CalendarEvent();
    var index = 0;

    //Line by line read of the data string
    const lines = dataString.split('\n').map(function(line){
        //Checking that the end of the file has not been reached yet
        if(!(line.includes("</feed>"))){
            
            //Grabbing information about the type and title of the event and updating the respective object variables
            if(line.includes("<title>")){
                //Updating type of event
                if(line.includes("Calendar Event:")){
                    if(line.toLowerCase().includes("office hours")){
                        newEvent.type = "Office Hours";
                    }
                    else if(line.toLowerCase().includes("discussion")){
                        newEvent.type = "Discussion";
                    }
                    else if(line.toLowerCase().includes("lab")){
                        newEvent.type = "Lab";
                    }
                    else if(line.toLowerCase().includes("exam") ||
                            line.toLowerCase().includes("test") ||
                            line.toLowerCase().includes("midterm") ||
                            line.toLowerCase().includes("final")){
                        newEvent.type = "Exam";
                    }
                    else if(line.toLowerCase().includes("quiz")){
                        newEvent.type = "Quiz";
                    }
                    else{
                        newEvent.type = "Event";  //CHECK EVENTS LATER TO SEE IF THEY HAVE A ZOOM LINK, IF SO, MAKE THEM CLASS TYPE
                    }
                }
                else if(line.includes("Assignment:")){
                    newEvent.type = "Assignment";
                }
                
                //Updating the title of the event
                newEvent.title = line.substring(line.indexOf(":") + 2, line.lastIndexOf("<"));
            }

            //Updating the year of the event
            if(line.includes("<published>")){
                newEvent.year = line.substring(line.indexOf(">") + 1, line.indexOf(">") + 5);
            }

            //Updating the link for events
            if(line.includes("<link") && !line.includes("rel=\"self\"")){
                if(!(newEvent.type == "Office Hours" || newEvent.type == "Discussion" || newEvent.type == "Lab" || newEvent.type == "Class")){
                    newEvent.link = line.substring(line.indexOf("http://"), line.lastIndexOf("\"/>"));
                    
                    if(newEvent.type == "Event"){
                        newEvent.link = "https" + newEvent.link.substring(4, newEvent.link.indexOf("instructure.com/") + 16) + "courses/" + newEvent.link.substring(35, 41) + "/calendar_events/" + newEvent.link.substring(89, 96);
                    }
                }
            }
            
            //Updating the class (ex: "CEN3031")
            if(line.includes("<name>")){
                newEvent.c = line.substring(line.indexOf(">") + 1, line.lastIndexOf("<"));
            }

            if(line.includes("<content type")){
                //Updating the link for zoom conferences and event types
                if(line.includes("zoom.us/")){
                    var subLine = line.substring(line.indexOf("https://"), line.indexOf("target="));
                    newEvent.link = subLine.substring(0, subLine.indexOf("\""));
                    
                    if(newEvent.type == "Event"){
                        newEvent.type = "Class";
                    }
                }

                //Updating the date and times of the event
                if(newEvent.type == "Office Hours" || newEvent.type == "Discussion" || newEvent.type == "Lab" || newEvent.type == "Class" || newEvent.type == "Event"){
                    newEvent.month = line.substring(line.indexOf(">") + 1, line.indexOf(">") + 4);
                    newEvent.day = parseInt(line.substring(line.indexOf(">") + 5, line.indexOf(">") + 7));
                }
                else{
                    newEvent.month = line.substring(line.indexOf(">") + 6, line.indexOf(">") + 9);
                    newEvent.day = parseInt(line.substring(line.indexOf(">") + 10, line.indexOf(">") + 12));
                }

                if(line.substring(0, 41).includes(" at ") || line.substring(0, 41).includes(" by ")){
                    var time;
                    if(line.substring(0, 41).includes(" at ")){
                        time = line.substring(line.indexOf(" at ") + 4, line.indexOf(" at ") + 11);
                    }
                    else{
                        time = line.substring(line.indexOf(" by ") + 4, line.indexOf(" by ") + 11);
                    }

                    if(time.includes(":")){
                        if(time.includes("am")){
                            if(time.includes(" ")){
                                newEvent.hour = parseInt(time.substring(1, 2));
                                newEvent.minute = parseInt(time.substring(3, 5));
                            }
                            else{
                                newEvent.hour = parseInt(time.substring(0, 2));
                                newEvent.minute = parseInt(time.substring(3, 5));
                            }
                            
                            if(newEvent.hour == 12){
                                newEvent.hour = 0;
                            }
                        }
                        else if(time.includes("pm")){
                            if(time.includes(" ")){
                                newEvent.hour = parseInt(time.substring(1, 2)) + 12;
                                newEvent.minute = parseInt(time.substring(3, 5));
                            }
                            else{
                                newEvent.hour = parseInt(time.substring(0, 2)) + 12;
                                newEvent.minute = parseInt(time.substring(3, 5));
                            }
                        }
                    }
                    else{
                        newEvent.minute = 0;

                        if(time.includes("am")){
                            if(time.includes(" ")){
                                newEvent.hour = parseInt(time.substring(1, 2));
                            }
                            else{
                                newEvent.hour = parseInt(time.substring(0, 2));
                            }

                            if(newEvent.hour == 12){
                                newEvent.hour = 0;
                            }
                        }
                        else if(time.includes("pm")){
                            if(time.includes(" ")){
                                newEvent.hour = parseInt(time.substring(1, 2)) + 12;
                            }
                            else{
                                newEvent.hour = parseInt(time.substring(0, 2)) + 12;
                            }
                        }
                    }
                }
            }

            //End of the line for 
            if(line.includes("</entry>")){
                //PUSH AKA COPY current event (NOT A POINTER) into collection
                events_arr[index] = Object.assign({}, newEvent);
                //console.log(newEvent.title + " - " + newEvent.class);
                newEvent.reset();
                index++;
            }
        }
        else{
            return;
        }
    });

    return events_arr;
}

function parseFile(file){
    //Create container for events
    let events_arrF = new Array(160);

    //parsing the file string and storing the events in events_arrF
    events_arrF = parse(file, events_arrF);

    if(events_arrF.length > 0)
        return events_arrF;
}

function parseLink(link){
    //Create container for events
    let events_arrL = new Array(160);

    //Correcting link file ending
    var newLink = link.substring(0, link.length - 4);
    newLink = newLink.concat(".atom");


    //Excluding CORS to prevent breakage -Max
    const headers = {
        'Accept': '*/*',
        'User-Agent': 'request',
    };

    const options = {
        url: newLink,
        headers:  headers
    };

    //Requesting the HTML from the .atom link and parsing it
    request(link, function(error, response, html){
        if(!error && response.statusCode == 200){
            //parsing the html string and storing the events in events_arrL
            return parse(html, events_arrL);
        }
        else{
            console.log("Error loading page");
        }
    });

    if(events_arrL.length > 0)
        return events_arrL;
}

module.exports = { parseFile, parseLink, CalendarEvent};