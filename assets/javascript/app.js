$(document).ready(function() {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBHWx8veGeiho9t3icVVLZFtPWhx8eMxd8",
        authDomain: "trainscheduler-dc9a8.firebaseapp.com",
        databaseURL: "https://trainscheduler-dc9a8.firebaseio.com",
        projectId: "trainscheduler-dc9a8",
        storageBucket: "trainscheduler-dc9a8.appspot.com",
        messagingSenderId: "333237278643"
    };

    firebase.initializeApp(config);

    // initialize variables
    var database = firebase.database();
    var nextTrain = 0;
    var tMinutesTillTrain = 0;

    // clears form fields
    function clearForm() {
        $("#tName").val("");
        $("#tDest").val("");
        $("#tTime").val("");
        $("#tFreq").val("");
    }

    // gets entries from form and adds to firebas db
    $("#tButton").on("click", function(event) {
        event.preventDefault();

        var tName = $("#tName").val().trim();
        var tDestination = $("#tDest").val().trim();
        var tStartTime = $("#tTime").val().trim();
        var tFrequency = $("#tFreq").val().trim();
       

        if (tName ==="" || tDestination === "" || tStartTime === "" || tFrequency === "") {
            alert("please enter all data");
            return;
        }
        
       

        database.ref().push({
            name: tName,
            destination: tDestination,
            starttime: tStartTime,
            frequency: tFrequency
        });
        clearForm();
        
        
        

    });

        // given frequency and start time, this will return the time the next train will arrive as well as the minutes from arrival
       function calcNextTrain(p1, p2) {

        var tFrequency = p1;
        var firstTime = p2;

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

        var currentTime = moment();

        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

        var tRemainder = diffTime % tFrequency;

        tMinutesTillTrain = tFrequency - tRemainder;

        nextTrain = moment().add(tMinutesTillTrain, "minutes");
        nextTrain = moment(nextTrain).format("hh:mm A");

        return [nextTrain, tMinutesTillTrain];
    };

    // called when data is added to firebase. populates the table body with all the train data.
    database.ref().on("child_added", function(snapshot) {
        // Append train info to new <tr>. (Using template strings from ES6)
        //using back ticks and then use the ${}
        $("#trainInfo").append(`
            <tr>
                <td>${snapshot.val().name}</td>
                <td>${snapshot.val().destination}</td>
                <td>${snapshot.val().frequency}</td>
                <td>${calcNextTrain(snapshot.val().frequency,snapshot.val().starttime)[0]}</td>
                <td>${calcNextTrain(snapshot.val().frequency,snapshot.val().starttime)[1]}</td>
                <td><button type="button" id="${snapshot.key}" class="btn btn-default edit-btn"><span class="glyphicon glyphicon-pencil"</span></button></td>
                <td><button type="button" id="${snapshot.key}" class="btn btn-default delete-btn"><span class="glyphicon glyphicon-trash"</span></button></td>
            </tr>
            `);
    });

    // removes the train infor based on the row that was clicked
    function deleteTrain() {
        if (confirm("Are you sure you want to delete this train?")) {
            database.ref().child($(this).attr('id')).remove();
            $(this).closest('tr').remove();
        };
    }

    // retrieves data for train from firebase and populates the form. removes data from firebase. 
    function editTrain() {

        var row_num = $(this).parent().parent().index();
        var clickKey = $(this).attr('id');

        var query = database.ref().orderByKey();
        query.once("value")
            .then(function(snapshot) {
                var snapObj = snapshot.val();
                snapshot.forEach(function(childSnapshot) {
                    var key = childSnapshot.key;
                     console.log(key);
                    var childData = childSnapshot.val();

                    if (key === clickKey) {
                        $("#tName").val(childData.name);
                        $("#tDest").val(childData.destination);
                        $("#tTime").val(childData.starttime);
                        $("#tFreq").val(childData.frequency);
                    }
                });
            });
            //alert("please delete");
            database.ref().child($(this).attr('id')).remove();
            $(this).closest("tr").remove();
           // $(document).on("click", "#tButton", deleteTrain);
    }

    // listeners for edit & delete buttons in table. 
    $(document).on("click", ".edit-btn", editTrain);
    $(document).on("click", ".delete-btn", deleteTrain);

    

});
