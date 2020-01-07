	//variabli, ki jih rabiš v več ku 1 funkciji
	var username;
	var mysql = require('mysql');
	//spremeni glede na svoje nastavitve
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456789',
		database: 'storage'
	});
	//povezava
	connection.connect(function(err){
		if(document.getElementById("loginSite")!=null){
			if(err){ console.log(error.code);document.getElementById("connectionStatus").innerHTML = "Napaka v povezavi.";}
				else{
					document.getElementById("connectionStatus").innerHTML ="Povezava vzpostavljena.";
				}
		}else{
			//get username z inserte, delete
			username = sessionStorage.getItem('user');
			console.log(username);
		}
	});
	//Preveri uporabnika in odpri mehanik/skladiscnik zaloga
	function checkUser(){
		var users;
		username = document.getElementById("user").value;
		var pass = document.getElementById("pass").value;
		var isSklad = null;
		var checked = false;
		//console.log(username+"|"+pass);
		var query = "SELECT USERNAME, PASSWORD, SKLADISCNIK from uporabnik WHERE USERNAME like '"+username+"'";
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				document.getElementById("connectionStatus").innerHTML ="Povezava vzpostavljena.";
				users = JSON.parse(JSON.stringify(results));
				console.log(results);
				if(results.length>0){
					if(users[0].USERNAME === username && users[0].PASSWORD === pass){
						checked = true;
						isSklad = users[0].SKLADISCNIK;
						sessionStorage.setItem('user', username);
					}
				}
				if(!checked){
					document.getElementById("connectionStatus").innerHTML = "Napačno uporabniškno ime ali geslo!";
				}else{
					if(isSklad == 1){
						const ipcRenderer = require('electron').ipcRenderer;
						ipcRenderer.send('changeWindow', 'skladiscnikZaloga.html')
					}else{
						const ipcRenderer = require('electron').ipcRenderer;
						ipcRenderer.send('changeWindow', 'mehanikZaloga.html')
					}
				}
			}
		});
	}
	
	function getZaloga(){
		var query = "select PARTNAME, PARTNUMBER, SUPPLY from shramba";
		var hits;
		var row;
		var cell;
		var table = document.getElementById("zalogca");
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				hits = JSON.parse(JSON.stringify(results));
				for(var i = 0; i<hits.length;i++){
					row = table.insertRow(0);
					cell = row.insertCell(0);
					cell.className += "sorting_1";
					cell.innerHTML = hits[i].PARTNAME;
					cell = row.insertCell(1);
					cell.innerHTML = hits[i].PARTNUMBER;
					cell = row.insertCell(2);
					cell.innerHTML = hits[i].SUPPLY;	
					cell = row.insertCell(3);
					cell.innerHTML = "<button onclick=\"prevzemZaloge(this);\" class=\"btn btn-outline-success\">PREVZEM</button>"
				}
			}
		});
	}
		
	function prevzemZaloge(e){
		//preberi vrednosti iz vrste
		var partnumber,partname,supply;
		var table = document.getElementById('zalogca');
		var rowId = e.parentNode.parentNode.rowIndex;
		var rowSelected = table.getElementsByTagName('tr')[rowId-1];
		partname = rowSelected.cells[0].innerHTML;
		partnumber = rowSelected.cells[1].innerHTML;
		supply = rowSelected.cells[2].innerHTML;
		console.log(partname+"|"+partnumber+"|"+supply);
	}
	
	
	
	
	