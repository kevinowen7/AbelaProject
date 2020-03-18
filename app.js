const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const port = process.env.PORT || 8000;

const app = express()
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

dataCategory=[];
dataTenant=[];

function textAbstract(text, length) {
	if (text == null) {
		return "";
	}
	if (text.length <= length) {
		return text;
	}
	text = text.substring(0, length);
	last = text.lastIndexOf(" ");
	text = text.substring(0, last);
	return text + "...";
}

//halaman product
app.get('/product', function (req, res) {
	dataCategory=[]
	//get all category
	axios.get('https://abela-app-android.herokuapp.com/getcategory')
	.then((response) => {
		dataCategory = response.data;
		res.render('product', {error:0,data:"",category:dataCategory});
	})
	.catch((error) => {
		res.render('product',{error:1,data:"Error Load Category",category:dataCategory});
	})
})

app.post('/add_product', function (req, res) {
	name = req.body.name;
	information = req.body.information;
	url_photo = req.body.url_photo;
	category_id = req.body.category_id;
	// add new product
	axios.post('https://abela-app-android.herokuapp.com/addnewproduct', {
		name: name,
		information : information,
		url_photo : url_photo,
		category_id : category_id
	})
	.then((response) => {
		if (response.data=="Sukses"){
			res.render('product', {error:0,data:"New Product Added",category:dataCategory});
		} else {
			res.render('product',{error:1,data:"Error Add New Product",category:dataCategory});
		}
	})
	.catch((error) => {
		res.render('product',{error:1,data:"Error Add New Product",category:dataCategory});
	})
});

//halaman tenant
app.get('/tenant', function (req, res) {
    dataTenant=[]
	//get all tenant
	axios.get('https://abela-app-android.herokuapp.com/showalltenant')
	.then((response) => {
		console.log(response.data);
		dataTenant = response.data;
		for (var i=0;i<dataTenant.length;i++){
			dataTenant[i].street_name = textAbstract(String(dataTenant[i].street_name),60)
		}
	
		res.render('tenant', {error:0,data:"",tenant:dataTenant});
	})
	.catch((error) => {
		console.log(error)
		res.render('tenant',{error:1,data:"Error Load data tenant",tenant:dataTenant});
	})
})

app.post('/change_stat_tenant', function (req, res) {
	id = req.body.id;
	status = req.body.status;
	//change tenant
	axios.post('https://abela-app-android.herokuapp.com/updatestatustenant', {
		tenant_id: id,
		status : status
	})
	.then((response) => {
		//reset data tenant
		dataTenant=[]
		axios.get('https://abela-app-android.herokuapp.com/showalltenant')
		.then((response) => {
			console.log(response.data);
			dataTenant = response.data;
			for (var i=0;i<dataTenant.length;i++){
				dataTenant[i].street_name = textAbstract(String(dataTenant[i].street_name),60)
			}
		
			res.render('tenant', {error:0,data:"Status tenant "+id+" has been changed",tenant:dataTenant});
		})
		.catch((error) => {
			console.log(error)
			res.render('tenant',{error:1,data:"Error Load data tenant",tenant:dataTenant});
		})
	})
	.catch((error) => {
		console.log(error)
		res.render('tenant',{error:1,data:"Error update data tenant",tenant:dataTenant});
	})
});

// halaman index
app.get('/', function (req, res) {
  res.render('index');
})

app.get('/index', function (req, res) {
  res.redirect('/');
})

app.post('/login', function (req, res) {
	username = req.body.username;
	password = req.body.password;
	// validasi login
	axios.post('https://abela-app-android.herokuapp.com/adminlogin', {
		username: username,
		password : password
	})
	.then((response) => {
		console.log(response.data)
		if (response.data=="Sukses"){
			res.redirect('/product');
		} else {
			res.redirect('/');
		}
	})
	.catch((error) => {
		res.redirect('/');
	})
})

app.listen(port, function () {
  console.log('Example app listening on port 8000!')
})
