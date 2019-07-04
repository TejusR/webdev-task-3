var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
	var username,curid;

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'tejus@123',
	database : 'login'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.connect(function(err){
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
		 if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.render('home.ejs',{user:request.session.username});
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});
app.post('/create',function(request,response){
	if (request.session.loggedin)
		response.render('create.ejs',{user:request.session.username});
});
app.post('/createlink',function(request,response){
  var n=request.body.submit;
	var qn=[],typ=[];
	var tot;
	connection.connect(function(err){
  connection.query('select * from '+username,function(err,results,fields){
	tot=results.length+1;
	connection.query("INSERT INTO "+username+" VALUES('?',?,?)",[results.length+1,request.body.fname,request.body.des]);
	for(var i=1;i<=n;i++)
	{
		qn[i]=request.body["q"+i];
		typ[i]=request.body["a"+i];
	}
		connection.query("CREATE TABLE "+username+"_"+results.length+" (id int,question varchar(50),type varchar(50),name varchar(50),des varchar(100))");
		for(var i=1;i<=n;i++)
		{
			connection.query("INSERT INTO "+username+"_"+results.length+" VALUES('?',?,?,?,?)",[i,request.body["q"+i],request.body["a"+i],request.body.fname,request.body.des]);
		}
			connection.query("CREATE TABLE "+username+"_"+results.length+"_a (ans json)");
			response.render('showlink.ejs',{link:"http://localhost:3000/"+username+"_"+results.length});
		});
	});
});
app.get('/:id',function(request,response){
	connection.connect(function(err){
		connection.query("SELECT * FROM "+request.params.id,function(err,result,fields){
			//response.send(request.params.id);
			response.render('form.ejs',{questions:result,formid:request.params.id});
		});
	});
});
app.post('/submitted',function(request,response){
	var ans=[]
	connection.connect(function(err){
		connection.query("SELECT * FROM "+request.body.submit,function(err,results,fields){
			for(var i=0;i<results.length;i++)
			{
				ans[i]=request.body["a"+i];
			}
			var obj={"answers":ans};
			connection.query("INSERT INTO "+request.body.submit+"_a VALUES(?)",[JSON.stringify(obj)]);
		});
	});
	response.send("thank you for submitting!");
});
app.post('/reg',function(request,response){
		response.render('reg.ejs',{message:""});
});
app.post('/createaccount',function(request,response){
	   connection.connect(function(err){
			 connection.query("SELECT * FROM accounts WHERE username=?",[request.body.user],function(error,results,fields){
				 if(results.length>0){
					 response.render('reg.ejs',{message:"USERNAME ALREADY EXISTS"});
				 }
			 });
			 connection.query("INSERT INTO accounts VALUES(?,?)",[request.body.user,request.body.pass]);
			 connection.query("CREATE TABLE "+request.body.user+" (id int,name varchar(50),des varchar(100))");
			 response.redirect('/');
		 });
});
app.post('/check',function(request,response){
	if(request.session.loggedin){
		connection.connect(function(err){
			connection.query("SELECT * FROM "+request.session.username,function(err,result,fields){
				if(result.length>0){
					response.render('check.ejs',{forms:result});
				}
				else {
				  responde.send("No Forms Available");
				}
			});
		});
	}
	else {
		response.send("login to view this");
	}
});
app.post('/responses/:id',function(request,response){
 connection.connect(function(err){
	 connection.query("SELECT * FROM "+request.session.username+"_"+request.params.id+"_a",function(err,results,fields){
		 if(results.length>0)
		 {
			 connection.query("SELECT * FROM "+request.session.username+"_"+request.params.id,function(error,res,field){
			 response.render('show.ejs',{a:results,q:res});
		  });
		 }
		 else {
		 	response.send("NO responses yet");
		 }
	 });
 });
});
app.listen(3000);
