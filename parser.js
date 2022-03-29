const downloadFile = (file) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'Download Btn');
    element.setAttribute('download', file);
  
    element.style.display = 'none';
  
    document.body.appendChild(element);
  
    element.click();
    document.body.removeChild(element);
  }

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

downloadFile("calendar.ics", "https://ufl.instructure.com/feeds/calendars/user_BkaffhCJl6Sh6F30F7EJ0RvsAWA8arHizxJ4xMus.ics");

const input = document.querySelector('input[type="file"]')
input.addEventListener('change', function(e){
    console.log(input.files);
    const reader = new FileReader();
    reader.onload = function(){
        //Create new calendar event
        let newEvent = new CalendarEvent();

        //Flag variables to allow for multi-line parts to be concatenated
        var checkNext = false;
        var appendURL = false;
        var appendSummary = false;

        const lines = reader.result.split('\n').map(function(line){
            if(!(line.includes("END:VCALENDAR") || line == "")){
                
                if(checkNext){
                    if(appendURL){
                        //Appending the 2nd line of the link
                        newEvent.link = newEvent.link + line.substring(1, line.length - 1);

                        //Splicing the link together to form a link to the assignment rather than the calendar event
                        if(line.includes("#assignment_")){
                            newEvent.link = line.substring(4, 32) + "courses/" + line.substring(65, 71) + "/assignments/" + line.substring(102, line.length - 1);
                        }
                        else if(line.includes("#calendar_event")){
                            newEvent.link = line.substring(4, 32) + "courses/" + line.substring(65, 71) + "/calendar_events/" + line.substring(106, line.length - 1);
                        }

                        appendURL = false;
                    }
                    else if(appendSummary){
                        if(!line.includes("URL:")){
                            //Continuously appending the next line of the summary until reaching the next attribute
                            newEvent.title = newEvent.title + line.substring(1, line.length - 1);
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
                                newEvent.link = newEvent.description.substring(49, newEvent.description.length - 2);
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
                            console.log(newEvent.type);
                            appendSummary = false;
                        }
                    }
                    else if(!(line.includes("SEQUENCE:") || line.includes("LOCATION:"))){
                        //Continuously appending the next line of the description until reaching the next attribute
                        newEvent.description = newEvent.description + line.substring(1, line.length - 1);
                    }
                    else{
                        checkNext = false;
                    }
                }

                if(line.includes("UID:")){
                    newEvent.uid = line.substring(4, line.length - 1);
                }

                //COME BACK TO DATE BC IT VARIES PER EVENT AND HAS TIME ZONE SHIFT
                if(line.includes("DTSTART;VALUE=DATE:") || line.includes("DTSTART:")){
                    var date = "";
                    if(line.includes("DTSTART;VALUE=DATE:")){
                        date = line.substring(19, line.length - 1);
                        
                        //Catch case for 11:59 PM due time, since it is
                        //displayed as 000000 rather than 235900
                        if(line.substring(28, line.length - 1) == "000000"){
                            startHour = 23;
                            startMinute = 59;
                        }
                        startHour = parseInt(line.substring(18, 20)) - 4;
                        startMinute = parseInt(line.substring(20, 22));
                    }
                    else if(line.includes("DTSTART:")){
                        date = line.substring(8, line.length - 1);
                        startHour = parseInt(line.substring(18, 20));
                        startMinute = parseInt(line.substring(20, 22));
                    }

                    year = parseInt(date.substring(0, 4));
                    month = parseInt(date.substring(4, 6));
                    day = parseInt(date.substring(6, 8));
                }

                if(line.includes("DTEND;VALUE=DATE:") || line.includes("DTEND:")){
                    var date = ""
                    if(line.includes("DTEND;VALUE=DATE:")){
                        date = line.substring(19, line.length - 1);
                        
                        //Catch case for 11:59 PM due time, since it is
                        //displayed as 000000 rather than 235900
                        if(line.substring(28, line.length - 1) == "000000"){
                            endHour = 23;
                            endMinute = 59;
                        }

                        if(parseInt(line.substring(18, 20)) < 4){
                            endHour = parseInt(line.substring(18, 20)) + 20;
                        }
                        else{
                            endHour = parseInt(line.substring(18, 20)) - 4;
                        }

                        endMinute = parseInt(line.substring(20, 22));
                    }
                    else if(line.includes("DTEND:")){
                        date = line.substring(8, line.length - 1);
                        endHour = parseInt(line.substring(18, 20));
                        endMinute = parseInt(line.substring(20, 22));
                    }
                }

                if(line.includes("DESCRIPTION:")){
                    newEvent.description = line.substring(12, line.length - 1);
                    checkNext = true;
                }

                if(line.includes("SUMMARY:")){
                    newEvent.title = line.substring(8, line.length - 1);
                    appendSummary = true;
                    checkNext = true;
                }

                if(line.includes("URL:")){
                    if(newEvent.type != "Office Hours" || newEvent.type != "Discussion" || newEvent.type != "Lab" || newEvent.type != "Class"){
                        newEvent.link = line.substring(4, line.length - 1);
                    }
                    appendURL = true;
                    checkNext = true;
                }

                if(line.includes("END:VEVENT:")){
                    //PUSH AKA COPY current event (NOT A POINTER) into collection
                    events_arr.push(newEvent);
                    newEvent.reset();
                }
            }
        })
    }
    reader.readAsText(input.files[0]);
}, false)