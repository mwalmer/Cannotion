import {small_file} from "../tests/2Events.js";
import {large_file} from "../tests/20Events.js";

//Defining the CalendarEvent class
class CalendarEvent{
    title = "";
    
    //Four digit format
    year = 0;
    
    //Two digit format, so January 7th is 01 for the month and 07 for the day
    month = 0;
    day = 0;
    
    //24 hour format to avoid handling of AM/PM
    startHour = 0;
    startMinute = 0;
    endHour = 0;
    endMinute = 0;
    
    class = "";
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
        this.class = "";
        this.type = "";
        this.description = "";
        this.link = "";
        this.uid = "";
        this.year = 0;
        this.month = 0;
        this.day = 0;

        this.startHour = 0;
        this.startMinute = 0;
        this.endHour = 0;
        this.endMinute = 0;
    }
}

//Create container for events
let events_arr = [];
// const input = document.querySelector('input[type="file"]')
export function parseFile(file){
    // console.log(input.files);
    //Create new calendar event
    let newEvent = new CalendarEvent();

    //Flag variables to allow for multi-line parts to be concatenated
    var checkNext = false;
    var appendURL = false;
    var appendSummary = false;

    const lines = file.split('\n').map(function(line){
        if(!(line.includes("END:VCALENDAR") || line == "")){
            
            if(checkNext){
                if(appendURL){
                    //Appending the 2nd line of the link
                    newEvent.link = newEvent.link + line.substring(1, line.length);
                    console.log(newEvent.link);
                    //Splicing the link together to form a link to the assignment rather than the calendar event
                    if(newEvent.link.includes("#assignment_")){
                        newEvent.link = newEvent.link.substring(0, 28) + "courses/" + newEvent.link.substring(61, 67) + "/assignments/" + newEvent.link.substring(99, 106);
                    }
                    else if(newEvent.link.includes("#calendar_event")){
                        newEvent.link = newEvent.link.substring(0, 28) + "courses/" + newEvent.link.substring(61, 67) + "/calendar_events/" + newEvent.link.substring(103, 110);
                    }

                    appendURL = false;
                    checkNext = false;
                }
                else if(appendSummary){
                    if(!line.includes("URL:")){
                        //Continuously appending the next line of the summary until reaching the next attribute
                        newEvent.title = newEvent.title + line.substring(1, line.length);
                    }
                    else{
                        //Updates the class (Ex. CEN3031) variable in the object
                        newEvent.class = newEvent.title.substring(newEvent.title.lastIndexOf("[") + 1, newEvent.title.length - 1);
                        
                        //Determines the type of event based of intormation in the title and updates the corresponding variable
                        if(newEvent.description.includes("[Click here to join Zoom Meeting:")){
                            if(newEvent.title.toLowerCase().includes("office hours")){
                                newEvent.type = "Office Hours";
                            }
                            else if(newEvent.title.toLowerCase().includes("discussion")){
                                newEvent.type = "Discussion";
                            }
                            else if(newEvent.title.toLowerCase().includes("lab")){
                                newEvent.type = "Lab";
                            }
                            else{
                                newEvent.type = "Class";
                            }

                            //Updating the link variable with the respective zoom link
                            newEvent.link = newEvent.description.substring(49, newEvent.description.length - 1);
                        }
                        else if(newEvent.title.toLowerCase().includes("exam") ||
                                newEvent.title.toLowerCase().includes("test") ||
                                newEvent.title.toLowerCase().includes("midterm") ||
                                newEvent.title.toLowerCase().includes("final")){
                            newEvent.type = "Exam";
                        }
                        else if(newEvent.title.toLowerCase().includes("quiz")){
                            newEvent.type = "Quiz";
                        }
                        else if(newEvent.uid.toLowerCase().includes("calendar-event")){
                            newEvent.type = "Event";
                        }
//***********************Are there any other types of events?
                        else{
                            newEvent.type = "Assignment";
                        }
                        appendSummary = false;
                        checkNext = false;
                    }
                }
                else if(!(line.includes("SEQUENCE:") || line.includes("LOCATION:") || line.includes("ALT-DESC"))){
                    //Continuously appending the next line of the description until reaching the next attribute
                    newEvent.description = newEvent.description + line.substring(1, line.length);
                }
                else{
                    checkNext = false;
                }
            }

            if(line.includes("UID:")){
                newEvent.uid = line.substring(4, line.length);
            }

            //COME BACK TO DATE BC IT VARIES PER EVENT AND HAS TIME ZONE SHIFT
            if(line.includes("DTSTART;VALUE=DATE:") || line.includes("DTSTART:")){
                var date = "";
                if(line.includes("DTSTART;VALUE=DATE:")){
                    date = line.substring(19, line.length);
                    //Catch case for 11:59 PM due time, since it is
                    //displayed as 000000 rather than 235900
                    if(date.substring(9, line.length) == "000000"){
                        newEvent.startHour = 23;
                        newEvent.startMinute = 59;
                    }
                    else{
                        if(parseInt(date.substring(9, 11)) < 4){
                            newEvent.startHour = parseInt(date.substring(9, 11)) + 20;
                        }
                        else{
                            newEvent.startHour = parseInt(date.substring(9, 11)) - 4;
                        }
                        newEvent.startMinute = parseInt(date.substring(11, 13));
                    }
                }
                else if(line.includes("DTSTART:")){
                    date = line.substring(8, line.length);
                    if(parseInt(date.substring(9, 11)) < 4){
                        newEvent.startHour = parseInt(date.substring(9, 11)) + 20;
                    }
                    else{
                        newEvent.startHour = parseInt(date.substring(9, 11)) - 4;
                    }
                    newEvent.startMinute = parseInt(date.substring(11, 13));
                }

                newEvent.year = parseInt(date.substring(0, 4));
                newEvent.month = parseInt(date.substring(4, 6));
                newEvent.day = parseInt(date.substring(6, 8));
            }

            if(line.includes("DTEND;VALUE=DATE:") || line.includes("DTEND:")){
                var date = ""
                if(line.includes("DTEND;VALUE=DATE:")){
                    date = line.substring(17, line.length);
                    //Catch case for 11:59 PM due time, since it is
                    //displayed as 000000 rather than 235900
                    if(date.substring(9, line.length) == "000000"){
                        newEvent.endHour = 23;
                        newEvent.endMinute = 59;
                    }
                    else{
                        if(parseInt(date.substring(9, 11)) < 4){
                            newEvent.endHour = parseInt(date.substring(9, 11)) + 20;
                        }
                        else{
                            newEvent.endHour = (parseInt(date.substring(9, 11)) - 4);
                        }

                        newEvent.endMinute = parseInt(date.substring(11, 13));
                    }

                }
                else if(line.includes("DTEND:")){
                    date = line.substring(6, line.length);
                    if(parseInt(date.substring(9, 11)) < 4){
                        newEvent.endHour = parseInt(date.substring(9, 11)) + 20;
                    }
                    else{
                        newEvent.endHour = (parseInt(date.substring(9, 11)) - 4);
                    }

                    newEvent.endMinute = parseInt(date.substring(11, 13));
                }
            }

            if(line.includes("DESCRIPTION:")){
                newEvent.description = line.substring(12, line.length);
                checkNext = true;
            }

            if(line.includes("SUMMARY:")){
                newEvent.title = line.substring(8, line.length);
                appendSummary = true;
                checkNext = true;
            }

            if(line.includes("URL:")){
                if(newEvent.type == "Office Hours" || newEvent.type == "Discussion" || newEvent.type == "Lab" || newEvent.type == "Class"){
                    newEvent.link = newEvent.description.substring(49, newEvent.description.length);
                }
                else{
                    newEvent.link = line.substring(4, newEvent.description.length);
                    appendURL = true;
                    checkNext = true;
                }
            }

            if(line.includes("END:VEVENT")){
                //PUSH AKA COPY current event (NOT A POINTER) into collection
                events_arr.push(Object.assign({}, newEvent));
                //console.log(newEvent.title + " - " + newEvent.class);
                newEvent.reset();
            }
        }
        else{
            return;
        }
    })
    for(const element of events_arr){
        console.log(element.title + " - " + element.class + " - " + element.type);
        console.log(element.link);
        console.log(element.description);
        console.log("Date: " + element.month + "/" + element.day + "/" + element.year);
        console.log("From: " + element.startHour + ":" + element.startMinute + " to " + element.endHour + ":" + element.endMinute);
        console.log("\n");6
    }
}

parseFile(large_file);