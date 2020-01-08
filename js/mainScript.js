	//variabli, ki jih rabiš v več ku 1 funkciji
	var username;
	var userID;
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
			getUserAndID();			
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
		var query = "SELECT USERNAME, PASSWORD, SKLADISCNIK, ID_USER from uporabnik WHERE USERNAME like '"+username+"'";
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
						sessionStorage.setItem('userID',users[0].ID_USER);
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
	//če iz neznanega razloga ni v username in userID podatkov kliči to da jih doda.
	function getUserAndID(){
		username = sessionStorage.getItem('user');
		userID = sessionStorage.getItem('userID');
	}
	//celotna zaloga mehanik KONČANO	
	function getZalogaFix(){
		var query = "select ID_ITEM, PARTNAME, PARTNUMBER, SUPPLY from shramba";
		var hits;
		var row;
		var cell;
		var table = $('.table').DataTable();
		table.clear().draw();
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				hits = JSON.parse(JSON.stringify(results));
				for(var i = 0; i<hits.length;i++){
					table.row.add([hits[i].PARTNAME,hits[i].PARTNUMBER,hits[i].SUPPLY,"<button onclick=\"prevzemZaloge(this);\" class=\"btn btn-outline-success\">PREVZEM</button>",hits[i].ID_ITEM]).draw(false);
				}
			}
		});
	}
	//zaloga skladiščnik KONČANO
	function getZalogaSklad(){
		var query = "select ID_ITEM, PARTNAME, PARTNUMBER, SUPPLY from shramba";
		var hits;
		var row;
		var cell;
		var table = $('.table').DataTable();
		table.clear().draw();
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				hits = JSON.parse(JSON.stringify(results));
				for(var i = 0; i<hits.length;i++){
					table.row.add([hits[i].PARTNAME,hits[i].PARTNUMBER,hits[i].SUPPLY,hits[i].ID_ITEM,"<button onclick=\"updateZaloga()\" class=\"btn btn-outline-success\">DODAJ</button>","<button onclick=\"deleteZaloga(this)\" class=\"btn btn-outline-danger izbrisi\">IZBRIŠI</button>"]).draw(false);
				}
			}
		});
	}
	//updati zalogo NEEDSFIX
	function updateZaloga(){
		console.log("UPDATE");
	}
	//briši item
	function deleteZaloga(e){
		if (confirm('Ali res želite izbrisati artikel')) {		
			var table = $('.table').DataTable();
			var data = table.row( $(e).parents('tr') ).data();
			var query = "DELETE FROM shramba WHERE ID_ITEM = "+data[3];
			connection.query(query, function(err, results){
				if(err){console.log(err);}
				else{
					getZalogaSklad();
				}
			});
		} else {
			console.log("SKIP THIS SHIT");
		}
	}
	//zaloga skladiščnik, kjer je SUPPLY = 0   NEEDSFIX
	function getEmptyItems(){
		var query = "select ID_ITEM, PARTNAME, PARTNUMBER, SUPPLY FROM shramba WHERE SUPPLY = 0";
		var hits;
		var row;
		var cell;
		var table =  $('.table').DataTable();
		table.clear().draw();
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				hits = JSON.parse(JSON.stringify(results));
				for(var i = 0; i<hits.length;i++){
					table.row.add([hits[i].PARTNAME,hits[i].PARTNUMBER,hits[i].SUPPLY,hits[i].ID_ITEM,"<button onclick=\"prevzemZaloge(this);\" class=\"btn btn-outline-success\">DODAJ</button>", "<button class=\"btn btn-outline-danger izbrisi\">IZBRIŠI</button>"]).draw(false);
				}
			}
		});
	}
	//poraba zaloge skladiščnik KONČANO
	function getPorabaZaloge(){
		var hits;
		var row;
		var cell;
		var table = $('.table').DataTable();
		table.clear().draw();
		var query = "SELECT FULL_NAME, DATE, KOLICINA, PARTNAME FROM shramba s JOIN porabil p ON (s.ID_ITEM = p.ID_ITEM) JOIN uporabnik u  ON (p.ID_USER = u.ID_USER)"
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				hits = JSON.parse(JSON.stringify(results));
				for(var i = 0; i<hits.length;i++){
					var date;
					var temp = hits[i].DATE.toString().substr(0,10).split("-");
					date = temp[2]+"."+temp[1]+"."+temp[0];
					table.row.add([hits[i].FULL_NAME,hits[i].PARTNAME,hits[i].KOLICINA,date]).draw(false);
					
				}				
			}
		});
	}
	
	
	//prevzem zaloge NEEDSFIX
	function prevzemZaloge(e){
		var table = $('.table').DataTable();
		var data = table.row( $(e).parents('tr') ).data();
		console.log(data);
		
	}
	//mehanik narocila od določenega uporabnika KONČANO
	function getNarocila(){
		getUserAndID();
		var query = "select i.ID_ORDER, PARTNAME, PARTNUMBER, REQUESTED, ORDERED, ARRIVED, CANCELLED from narocilo i JOIN narocil u ON (u.ID_ORDER = i.ID_ORDER) JOIN uporabnik t ON (t.ID_USER = u.ID_USER) AND t.ID_USER = "+userID;
		console.log(query);
		var hits;
		var row;
		var cell;
		var statusOrder;
		var table = $('.table').DataTable();
		table.clear().draw();
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				hits = JSON.parse(JSON.stringify(results));
				for(var i = 0; i<hits.length;i++){
					var flagOrdered = hits[i].ORDERED;
					var flagArrived = hits[i].ARRIVED;
					var flagCancelled = hits[i].CANCELLED;
					var flagRequested = hits[i].REQUESTED;
					if(flagArrived == 1){statusOrder = "Prispelo";}
					else if(flagCancelled == 1){statusOrder = "Preklicano";}
					else if(flagOrdered == 1){statusOrder = "Naročeno";}
					else if(flagRequested == 1){statusOrder = "Zahtevano";}						
					table.row.add([hits[i].PARTNUMBER, hits[i].PARTNAME,statusOrder,"<button onclick=\"cancelOrder(this);\" class=\"btn btn-outline-danger\">PREKLIČI</button>",hits[i].ID_ORDER]).draw(false);
				}
			}
		});		
	}
	//prekliči naročilo NEEDSFIX
	function cancelOrder(e){
		var partnumber,partname,statusOrder,orderID;
		var table = document.getElementById('narocila');
		var rowId = e.parentNode.parentNode.rowIndex;
		var rowSelected = table.getElementsByTagName('tr')[rowId-1];
		partname = rowSelected.cells[1].innerHTML;
		partnumber = rowSelected.cells[0].innerHTML;
		statusOrder = rowSelected.cells[2].innerHTML;
		orderID = rowSelected.cells[4].innerHTML;
		console.log(partname+"|"+partnumber+"|"+statusOrder+"|"+orderID);
		var query = "UPDATE narocilo SET REQUESTED = 0, ORDERED = 0, ARRIVED = 0, CANCELLED = 1 WHERE ID_ORDER = "+orderID;
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				console.log(results);
				getNarocila();
			}
		});		
	}
	
	//vstavi novo naročilo in poveži naročilo z uporabnikom NEEDSFIX
	function sendNarocilo(){
		var orderID;
		var partNumber = document.getElementById("stDela").value;
		var partName = document.getElementById("imeDela").value;
		console.log(partNumber+" | "+partName);
		var query = "INSERT INTO narocilo (PARTNUMBER,PARTNAME,REQUESTED,ORDERED,ARRIVED,CANCELLED) VALUES('"+partNumber+"','"+partName+"',1,0,0,0)";
		console.log(query);
		var query2 = "SELECT ID_ORDER FROM narocilo ORDER BY ID_ORDER DESC LIMIT 1";		
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				connection.query(query2,function(err,results){
					if(err){console.log(err);}
					else{
						orderID = JSON.parse(JSON.stringify(results));
						orderID = orderID[0].ID_ORDER;
						
						var query3 = "INSERT INTO narocil (ID_ORDER, ID_USER) values ("+orderID+","+userID+")";
						connection.query(query3, function(err, results){
							if(err){console.log(err);}
							else{
								alert("Narocilo oddano");
								getNarocila();
							}
							
						});
					}
				});
			}
		});
	}
	//pregled naročil VSA
	function getAllOrders(){
		var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME, REQUESTED, ORDERED, ARRIVED, CANCELLED FROM narocilo";
		var row;
		var cell;
		var hits;
		var table = $('.table').DataTable();
		table.clear().draw();
		document.getElementById("buttonPotrdi").style.display = 'none';
		connection.query(query, function(err, results){
			hits = JSON.parse(JSON.stringify(results));
			for(var i = 0; i<hits.length;i++){
				var flagOrdered = hits[i].ORDERED;
				var flagArrived = hits[i].ARRIVED;
				var flagCancelled = hits[i].CANCELLED;
				var flagRequested = hits[i].REQUESTED;
				var statusOrder;
				if(flagArrived == 1){statusOrder = "Prispelo";}
				else if(flagCancelled == 1){statusOrder = "Preklicano";}
				else if(flagOrdered == 1){statusOrder = "Naročeno";}
				else if(flagRequested == 1){statusOrder = "Zahtevano";}
				table.row.add([hits[i].PARTNUMBER,hits[i].PARTNAME,statusOrder,statusOrder]).draw(false);
				
			}
		});
	}
	//pregled naročil NOVA
	function getNewOrders(){
		var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME FROM narocilo WHERE REQUESTED = 1";
		var row;
		var cell;
		var hits;
		var table =  $('.table').DataTable();
		table.clear().draw();
		connection.query(query, function(err, results){
			hits = JSON.parse(JSON.stringify(results));
			for(var i = 0; i<hits.length;i++){
				table.row.add([hits[i].PARTNUMBER,hits[i].PARTNAME,"Zahtevano","<button onclick=\"onClickNarocila(this);\" class=\"btn btn-outline-success\">POTRDI</button>",hits[i].ID_ORDER]).draw(false);
			}
		});		
	}
	//pregled naročil NAROČENA KONČANO
	function getOrderedOrders(){
		var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME, REQUESTED, ORDERED, ARRIVED, CANCELLED FROM narocilo WHERE ORDERED= 1";
		var row;
		var cell;
		var hits;
		var table = $('.table').DataTable();
		table.clear().draw();
		connection.query(query, function(err, results){
			hits = JSON.parse(JSON.stringify(results));
			for(var i = 0; i<hits.length;i++){
				table.row.add([hits[i].PARTNUMBER,hits[i].PARTNAME,"Naročeno","<button onclick=\"onClickNarocila(this);\" class=\"btn btn-outline-success\">POTRDI</button>",hits[i].ID_ORDER]).draw(false);
			}
		});		
	}
	//pregled naročil PREKLICANA KONČANO
	function getCancelledOrders(){
		var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME FROM narocilo WHERE CANCELLED = 1";
		var row;
		var cell;
		var hits;
		var table = $('.table').DataTable();
		table.clear().draw();
		connection.query(query, function(err, results){
			hits = JSON.parse(JSON.stringify(results));
			for(var i = 0; i<hits.length;i++){
				table.row.add([hits[i].PARTNUMBER,hits[i].PARTNAME,"Preklicano","<button onclick=\"onClickNarocila(this);\" class=\"btn btn-outline-danger\">POTRDI</button>",hits[i].ID_ORDER]).draw(false);
			}
		});		
	}
	//pregled naročil PRISPELA KONČANO
	function getArrivedOrders(){
		var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME FROM narocilo WHERE ARRIVED = 1";
		var row;
		var cell;
		var hits;
		var table = $('.table').DataTable();
		table.clear().draw();
		connection.query(query, function(err, results){
			hits = JSON.parse(JSON.stringify(results));
			for(var i = 0; i<hits.length;i++){
				table.row.add([hits[i].PARTNUMBER,hits[i].PARTNAME,"Prispelo","<button onclick=\"onClickNarocila(this);\" class=\"btn btn-outline-success\">POTRDI</button>",hits[i].ID_ORDER]).draw(false);
			}
		});		
	}
	//preklopi med stanji naročil NEESSFIX
	function onClickNarocila(e){
		var partnumber,partname,statusOrder,orderID;
		var table = document.getElementById('narocila');
		var rowId = e.parentNode.parentNode.rowIndex;
		var rowSelected = table.getElementsByTagName('tr')[rowId-1];
		partname = rowSelected.cells[1].innerHTML;
		partnumber = rowSelected.cells[0].innerHTML;
		statusOrder = rowSelected.cells[2].innerHTML;
		orderID = rowSelected.cells[4].innerHTML;
		//console.log(partname+"|"+partnumber+"|"+statusOrder+"|"+orderID);
		var query;
		switch(statusOrder){
			case "Preklicano":query = "DELETE FROM narocilo WHERE ID_ORDER = "+orderID;break;
			case "Zahtevano":query = "UPDATE narocilo SET REQUESTED = 0, ORDERED = 1 WHERE ID_ORDER = "+orderID;break;
			case "Naročeno":query = "UPDATE narocilo SET ORDERED = 0, ARRIVED = 1 WHERE ID_ORDER = "+orderID;break;
		}
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				switch(statusOrder){
					case "Preklicano":getCancelledOrders();break;
					case "Zahtevano":getNewOrders();break;
					case "Naročeno":getOrderedOrders();break;
				}
			}
		});
	}
	
	//bazo sm mal popravu, da se v primeru deleta naročila izbriše tudi v tabeli narocil, dodal še 1 boolean za naročila k je manjkal
	//TODO še en gumb v skladiscnikNarocila za Naročena
	//TODO pri skladiscniku še eno okno za pregled nad uporabniki, dodajanje uporabnikov, update in delete
	//TODO skladiscikZaloga - polje za dodat nov item
	
	
	