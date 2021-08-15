var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var ejs = require('ejs');
var router = express.Router();



var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'management'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.use(express.static("public"));

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM `login credentials` WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		connection.query('SELECT role FROM `login credentials` WHERE username = ?',[request.session.username], function(error,results,fields){
			var userrole = results[0].role;
			if(userrole == "admin"){
				response.sendFile((path.join(__dirname + '/admin.html')));
			}
			else
			{
				response.sendFile(path.join((__dirname + '/user.html')));
			}
		});
	} else {
		response.send('Please login to view this page!');
		response.end();
	}
});

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.get('/employee',function(req, res){
	connection.query('SELECT * FROM `employee details`', function (err, results){
		if (err) throw err;
		res.render('employee', {
			employees : results
		});
	});
});

app.get('/adduser', function(req, res){
	res.render('add_user',{});
});

app.post('/save', function(req, res){
	var userlogin = [req.body.username, req.body.password, req.body.UserID, req.body.role]
	var userData = [req.body.UserID, req.body.lname, req.body.fname, req.body.department, req.body.city]
	var sql1 = "INSERT INTO `employee details` (UserID, firstname,lastname, department, city) VALUES (?)"
	var sql2 = "INSERT INTO `login credentials` (username, password, UserID, role) VALUES (?)"
	connection.query(sql1, [userData], function(err,results){
		if(err) throw err;
	});
	connection.query(sql2, [userlogin], function(err,results){
		if(err) throw err;
		res.redirect('/employee');
	});
});

app.get('/edit/:UserID', (req,res)=>{
	const UserID = req.params.UserID;
	let sql = 'SELECT * FROM `employee details` WHERE UserID = ?'
	connection.query(sql, UserID, (err, results)=>{
		if (err) throw err;
		res.render('edit_user',{
			employee: results[0]
		})
	})
})

app.post('/update', (req,res)=>{
	const UserID = req.body.UserID;
	let sql1 = "UPDATE `employee details` SET lastname=(?), firstname =(?), department = (?), city = (?) WHERE UserID = (?)";
	let sql2 = "UPDATE `login credentials` SET role=(?) WHERE UserID=(?)";
	connection.query(sql1, [req.body.lname, req.body.fname, req.body.department, req.body.city,UserID], (err, results)=>{
		if (err) throw err;
	})
	connection.query(sql2, [req.body.role, UserID], (err, results)=>{
		if (err) throw err;
		res.redirect('/employee')
	});
});

app.get('/delete/:UserID', (req,res)=>{
	const UserID = req.params.UserID;
	let sql1 = 'DELETE FROM `employee details` WHERE UserID = ?'
	let sql2 = 'DELETE FROM `login credentials` WHERE UserID = ?'
	connection.query(sql2, UserID, (err, results)=>{
		if (err) throw err;
	})
	connection.query(sql1, UserID, (err, results)=>{
		if (err) throw err;
		res.redirect('/employee')
	});
});



app.get('/department',function(req, res){
	connection.query('SELECT * FROM `departments`', function (err, results){
		if (err) throw err;
		res.render('department', {
			dept : results
		});
	});
});

app.get('/adddept', function(req, res){
	res.render('add_dept',{});
});

app.post('/savedept', function(req, res){
	var deptData = [req.body.DeptID, req.body.department]
	var sql = "INSERT INTO `departments` (DeptID, department) VALUES (?)"
	connection.query(sql, [deptData], function(err,results){
		if(err) throw err;
		res.redirect('/department');
	});
});

app.get('/editdept/:DeptID', (req,res)=>{
	const DeptID = req.params.DeptID;
	let sql = 'SELECT * FROM `departments` WHERE DeptID = ?'
	connection.query(sql, DeptID, (err, results)=>{
		if (err) throw err;
		res.render('edit_dept',{
			department: results[0]
		})
	})
})

app.post('/updatedept', (req,res)=>{
	const DeptID = req.body.DeptID;
	let sql = "UPDATE `departments` SET Department=(?) WHERE DeptID=(?)";
	connection.query(sql, [req.body.Department, DeptID], (err, results)=>{
		if (err) throw err;
		res.redirect('/department')
	});
});

app.get('/deletedept/:DeptID', (req,res)=>{
	const DeptID = req.params.DeptID;
	let sql = 'DELETE FROM `departments` WHERE DeptID = ?'
	connection.query(sql, DeptID, (err, results)=>{
		if (err) throw err;
		res.redirect('/department')
	});
});



app.listen(3000);