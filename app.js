var express = require('express');
var path = require('path');

var db = require('mongoskin').db("localhost/testdb", { w: 0});
    db.bind('event');



var app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

app.get('/rooms', function(req, res) { 
    res.render('rooms', {title: 'Hulk', rooms: ['Spiderman','Hawkeye','Black Widow']});
});

app.get('/init', function(req, res){

	var d = new Date();
	db.event.insert({ 
		text:"Meeting with Mickey Mouse", 
		start_date: d,
		end_date:	d.setHours(d.getHours() + 1)
	});
	 d = new Date();
	db.event.insert({ 
		text:"Meeting with Donald Duck", 
		start_date: d.setHours(d.getHours() + 2),
		end_date:	d.setHours(d.getHours() + 1)
	});
	 d = new Date();
	db.event.insert({ 
		text:"Meeting with Goofy", 
		start_date: d.setHours(d.getHours() + 3),
		end_date:	d.setHours(d.getHours() + 1)
	});
	 d = new Date();
	db.event.insert({ 
		text:"Meeting with Minnie Mouse", 
		start_date: d.setHours(d.getHours() + 4),
		end_date:	d.setHours(d.getHours() + 1),
		color: "#DD8616"
	});

	res.send("Test events were added to the database")
});


app.get('/data', function(req, res){
        console.log("GET /data is called");
	db.event.find().toArray(function(err, data){
                console.log("data is: " + data);
		//set id property for all records
                if( data != null) {
       			for (var i = 0; i < data.length; i++)
				data[i].id = data[i]._id;
		
			//output response
			res.send(data);
                } else {
                	res.send(err);
               }
	});
});


app.post('/data', function(req, res){
        console.log("POST /data is called");
	var data = req.body;
	var mode = data["!nativeeditor_status"];
	var sid = data.id;
	var tid = sid;

	delete data.id;
	delete data.gr_id;
	delete data["!nativeeditor_status"];

        console.log("DATA IS: " + data);
        console.log("MODE IS: " + mode);


	function update_response(err, result){
		if (err)
			mode = "error";
		else if (mode == "inserted")
			tid = data._id;

		res.setHeader("Content-Type","text/xml");
		res.send("<data><action type='"+mode+"' sid='"+sid+"' tid='"+tid+"'/></data>");
	}

	if (mode == "updated")
		db.event.updateById( sid, data, update_response);
	else if (mode == "inserted")
		db.event.insert(data, update_response);
	else if (mode == "deleted")
		db.event.removeById( sid, update_response);
	else
		res.send("Not supported operation");
});

app.listen(3000, function() { console.log("Starting at port 3000..."); } );
