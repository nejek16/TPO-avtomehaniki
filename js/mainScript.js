//variabli, ki jih rabiš v več ku 1 funkciji
var username;
var userID;
var selectedID;
var selectedSupply;
var mysql = require('mysql');
//spremeni glede na svoje nastavitve
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '123456789',
	database: 'storage'
});

var shramba = [];

//povezava
connection.connect(function (err) {
	if (err) {
		console.log('Not connected '.red, err.toString().red, ' RETRYING...'.blue);
		d.reject();
	}

	if (document.getElementById("loginSite") != null) {
		if (err) { console.log(error.code); document.getElementById("connectionStatus").innerHTML = "Napaka v povezavi."; }
		else {
			document.getElementById("connectionStatus").innerHTML = "Povezava vzpostavljena.";
		}
	} else {
		getUserAndID();
	}
});
//Preveri uporabnika in odpri mehanik/skladiscnik zaloga
function checkUser() {
	var users;
	username = document.getElementById("user").value;
	var pass = document.getElementById("pass").value;
	var isSklad = null;
	var checked = false;
	var query = "SELECT USERNAME, PASSWORD, SKLADISCNIK, ID_USER from uporabnik WHERE USERNAME like '" + username + "'";
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			document.getElementById("connectionStatus").innerHTML = "Povezava vzpostavljena.";
			users = JSON.parse(JSON.stringify(results));
			if (results.length > 0) {
				if (users[0].USERNAME === username && users[0].PASSWORD === pass) {
					checked = true;
					isSklad = users[0].SKLADISCNIK;
					sessionStorage.setItem('user', username);
					sessionStorage.setItem('userID', users[0].ID_USER);
				}
			}
			if (!checked) {
				document.getElementById("connectionStatus").innerHTML = "Napačno uporabniškno ime ali geslo!";
			} else {
				if (isSklad == 1) {
					const ipcRenderer = require('electron').ipcRenderer;
					ipcRenderer.send('changeWindow', 'skladiscnikZaloga.html')
				} else {
					const ipcRenderer = require('electron').ipcRenderer;
					ipcRenderer.send('changeWindow', 'mehanikZaloga.html')
				}
			}
		}
	});
}
//če iz neznanega razloga ni v username in userID podatkov kliči to da jih doda.
function getUserAndID() {
	username = sessionStorage.getItem('user');
	userID = sessionStorage.getItem('userID');
}
//celotna zaloga mehanik KONČANO	
function getZalogaFix() {
	var query = "select ID_ITEM, PARTNAME, PARTNUMBER, SUPPLY from shramba";
	var hits;
	var row;
	var cell;
	var table = $('.table').DataTable();
	table.clear().draw();
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			hits = JSON.parse(JSON.stringify(results));
			for (var i = 0; i < hits.length; i++) {
				table.row.add([hits[i].PARTNAME, hits[i].PARTNUMBER, hits[i].SUPPLY, "<button onclick=\"prevzemZaloge(this);\" class=\"btn btn-outline-success\">PREVZEM</button>", hits[i].ID_ITEM]).draw(false);
			}
		}
	});
}
//zaloga skladiščnik KONČANO
function getZalogaSklad() {
	var query = "select ID_ITEM, PARTNAME, PARTNUMBER, SUPPLY from shramba";
	var hits;
	var row;
	var cell;
	var table = $('.table').DataTable();
	table.clear().draw();
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			hits = JSON.parse(JSON.stringify(results));
			for (var i = 0; i < hits.length; i++) {
				table.row.add([hits[i].PARTNAME, hits[i].PARTNUMBER, hits[i].SUPPLY, hits[i].ID_ITEM, "<button onclick=\"updateZaloga(this)\" class=\"btn btn-outline-success\">SPREMENI</button>", "<button onclick=\"deleteZaloga(this)\" class=\"btn btn-outline-danger izbrisi\">IZBRIŠI</button>"]).draw(false);
			}
		}
	});
}

function addItemZaloga() {
	var partName = document.getElementById("imeDela").value;
	var partNumber = document.getElementById("stDela").value;
	var partSupply = document.getElementById("itemSupply").value;

	if (partName.length === 0) {
		alert("Vnesi ime artikla!");
		return;
	}

	if (isNaN(partNumber)) {
		alert("Številka artikla vsebuje prepovedane znake!");
		return;
	}

	if (partNumber.length === 0) {
		alert("Vnesi številko artikla!");
		return;
	}

	if (!partSupply || partSupply === 0 || partSupply < 0) {
		alert("Vnesi količino!");
		return;
	}

	var query = "select ID_ITEM, PARTNAME, PARTNUMBER, SUPPLY from shramba WHERE PARTNUMBER =" + partNumber;
	var hits;
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			hits = JSON.parse(JSON.stringify(results));
			if (hits.length > 0) {
				var supply = parseInt(hits[0].SUPPLY) + parseInt(partSupply);
				var query = "UPDATE shramba SET SUPPLY = " + supply + " WHERE PARTNUMBER = " + partNumber;
				connection.query(query, function (err, results) {
					if (err) {
						console.log(err);
					}
					else {
						getZalogaSklad();
					}
				});
			}
			else {
				var query = "INSERT INTO shramba (PARTNAME, PARTNUMBER, SUPPLY) VALUES ('" + partName + "','" + partNumber + "'," + partSupply + ")";
				connection.query(query, function (err, results) {
					if (err) { console.log(err); }
					else {
						getZalogaSklad();
					}
				});
			}
		}
	});
}
//odpri modal za dodajanje KONČANO
function updateZaloga(e) {
	var table = $('.table').DataTable();
	var data = table.row($(e).parents('tr')).data();
	var modal = $("#myModal").modal();
	selectedSupply = parseInt(data[2]);
	selectedID = parseInt(data[3]);
}

//update shramba z novo vrednostjo KONČANO
function updateZalogaPotrdi() {
	var dodaj = parseInt(document.getElementById("dodajZalogo").value);
	selectedSupply = selectedSupply + dodaj;

	if (selectedSupply < 0) {
		selectedSupply = 0;
	}

	var query = "UPDATE shramba SET SUPPLY = " + selectedSupply + " WHERE ID_ITEM = " + selectedID;
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			$('#myModal').modal('hide');
			getZalogaSklad();
		}
	});
}
//briši item
function deleteZaloga(e) {
	if (confirm('Ali res želite izbrisati artikel')) {
		var table = $('.table').DataTable();
		var data = table.row($(e).parents('tr')).data();
		var query = "DELETE FROM shramba WHERE ID_ITEM = " + data[3];
		connection.query(query, function (err, results) {
			if (err) { console.log(err); }
			else {
				getZalogaSklad();
			}
		});
	} else {

	}
}
//zaloga skladiščnik, kjer je SUPPLY = 0   KONČANO
function getEmptyItems() {
	var query = "select ID_ITEM, PARTNAME, PARTNUMBER, SUPPLY FROM shramba WHERE SUPPLY = 0";
	var hits;
	var row;
	var cell;
	var table = $('.table').DataTable();
	table.clear().draw();
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			hits = JSON.parse(JSON.stringify(results));
			for (var i = 0; i < hits.length; i++) {
				table.row.add([hits[i].PARTNAME, hits[i].PARTNUMBER, hits[i].SUPPLY, hits[i].ID_ITEM, "<button onclick=\"prevzemZaloge(this);\" class=\"btn btn-outline-success\">DODAJ</button>", "<button class=\"btn btn-outline-danger izbrisi\">IZBRIŠI</button>"]).draw(false);
			}
		}
	});
}
//poraba zaloge skladiščnik KONČANO
function getPorabaZaloge() {
	var hits;
	var row;
	var cell;
	var table = $('.table').DataTable();
	table.clear().draw();
	var query = "SELECT FULL_NAME, DATE, KOLICINA, PARTNAME FROM shramba s JOIN porabil p ON (s.ID_ITEM = p.ID_ITEM) JOIN uporabnik u  ON (p.ID_USER = u.ID_USER)"
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			hits = JSON.parse(JSON.stringify(results));
			for (var i = 0; i < hits.length; i++) {
				var date;
				var temp = hits[i].DATE.toString().substr(0, 10).split("-");
				date = temp[2] + "." + temp[1] + "." + temp[0];
				table.row.add([hits[i].FULL_NAME, hits[i].PARTNAME, hits[i].KOLICINA, date]).draw(false);

			}
		}
	});
}


//prevzem zaloge odpre modal
function prevzemZaloge(e) {
	var table = $('.table').DataTable();
	var data = table.row($(e).parents('tr')).data();
	var modal = $("#myModal").modal();
	var setLimit = document.getElementById("prevzemiZalogo");
	selectedSupply = data[2];
	selectedID = data[4]
	setLimit.max = selectedSupply;
}
//prevzem zaloge queryi v bazo
function prevzemZalogePotrdi() {
	var prevzem = document.getElementById("prevzemiZalogo").value;
	if (prevzem != 0) {
		var date;
		date = new Date();
		date = date.getUTCFullYear() + '-' +
			('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
			('00' + date.getUTCDate()).slice(-2) + ' ' +
			('00' + date.getUTCHours()).slice(-2) + ':' +
			('00' + date.getUTCMinutes()).slice(-2) + ':' +
			('00' + date.getUTCSeconds()).slice(-2);
		selectedSupply = selectedSupply - prevzem;
		var query = "UPDATE shramba SET SUPPLY = " + selectedSupply + " WHERE ID_ITEM = " + selectedID;
		var query2 = "INSERT INTO porabil (ID_ITEM, ID_USER, DATE, KOLICINA) VALUES (" + selectedID + "," + userID + ",'" + date + "'," + prevzem + ")";
		connection.query(query, function (err, results) {
			if (err) {
				console.log(err);
			}
			else {
				connection.query(query2, function (err, results) {
					if (err) { console.log(err); }
					else {
						$('#myModal').modal('hide');
						getZalogaFix();
					}
				});
			}
		});
	}
}
//mehanik narocila od določenega uporabnika KONČANO
function getNarocila() {
	getUserAndID();
	var query = "select i.ID_ORDER, PARTNAME, PARTNUMBER, REQUESTED, ORDERED, ARRIVED, CANCELLED from narocilo i JOIN narocil u ON (u.ID_ORDER = i.ID_ORDER) JOIN uporabnik t ON (t.ID_USER = u.ID_USER) AND t.ID_USER = " + userID;
	var hits;
	var row;
	var cell;
	var statusOrder;
	var table = $('.table').DataTable();
	table.clear().draw();
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			hits = JSON.parse(JSON.stringify(results));
			for (var i = 0; i < hits.length; i++) {
				var flagOrdered = hits[i].ORDERED;
				var flagArrived = hits[i].ARRIVED;
				var flagCancelled = hits[i].CANCELLED;
				var flagRequested = hits[i].REQUESTED;
				if (flagArrived == 1) { statusOrder = "Prispelo"; }
				else if (flagCancelled == 1) { statusOrder = "Preklicano"; }
				else if (flagOrdered == 1) { statusOrder = "Naročeno"; }
				else if (flagRequested == 1) { statusOrder = "Zahtevano"; }
				table.row.add([hits[i].PARTNUMBER, hits[i].PARTNAME, statusOrder, "<button onclick=\"cancelOrder(this);\" class=\"btn btn-outline-danger\">PREKLIČI</button>", hits[i].ID_ORDER]).draw(false);
			}
		}
	});
}
//prekliči naročilo KONČANO
function cancelOrder(e) {
	var partnumber, partname, statusOrder, orderID;
	var table = $('.table').DataTable();
	var data = table.row($(e).parents('tr')).data();
	var query = "UPDATE narocilo SET REQUESTED = 0, ORDERED = 0, ARRIVED = 0, CANCELLED = 1 WHERE ID_ORDER = " + data[4];
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			getNarocila();
		}
	});
}

//vstavi novo naročilo in poveži naročilo z uporabnikom KONČANO
function sendNarocilo() {
	var orderID;
	var partNumber = document.getElementById("stDela").value;
	var partName = document.getElementById("imeDela").value;

	if (isNaN(partNumber)) {
		alert("Številka artikla vsebuje prepovedane znake!");
		return;
	}

	var query = "select ID_ITEM, PARTNAME, PARTNUMBER, SUPPLY from shramba WHERE PARTNUMBER =" + partNumber;
	var hits;
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			hits = JSON.parse(JSON.stringify(results));
			if (hits.length > 0) {
				partName = hits[0].PARTNAME;
				partNumber = hits[0].PARTNUMBER;

				var query = "INSERT INTO narocilo (PARTNUMBER,PARTNAME,REQUESTED,ORDERED,ARRIVED,CANCELLED) VALUES('" + partNumber + "','" + partName + "',1,0,0,0)";
				var query2 = "SELECT ID_ORDER FROM narocilo ORDER BY ID_ORDER DESC LIMIT 1";
				connection.query(query, function (err, results) {
					if (err) { console.log(err); }
					else {
						connection.query(query2, function (err, results) {
							if (err) { console.log(err); }
							else {
								orderID = JSON.parse(JSON.stringify(results));
								orderID = orderID[0].ID_ORDER;
								var query3 = "INSERT INTO narocil (ID_ORDER, ID_USER) values (" + orderID + "," + userID + ")";
								connection.query(query3, function (err, results) {
									if (err) { console.log(err); }
									else {
										var modal = $("#myModal").modal();
									}

								});
							}
						});
					}
				});
			}
			else {
				alert("Zahtevanega dela ni mogoče naročiti.");
			}
		}
	});
}
//zapri potrditveno okno o oddanem naročilu
function closeModal() {
	getNarocila();
	$('#myModal').modal('hide');
}

//pregled naročil VSA
function getAllOrders() {
	var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME, REQUESTED, ORDERED, ARRIVED, CANCELLED FROM narocilo";
	var row;
	var cell;
	var hits;
	var table = $('.table').DataTable();
	table.clear().draw();
	table.column([3]).visible(false);
	connection.query(query, function (err, results) {
		hits = JSON.parse(JSON.stringify(results));
		for (var i = 0; i < hits.length; i++) {
			var flagOrdered = hits[i].ORDERED;
			var flagArrived = hits[i].ARRIVED;
			var flagCancelled = hits[i].CANCELLED;
			var flagRequested = hits[i].REQUESTED;
			var statusOrder;
			if (flagArrived == 1) { statusOrder = "Prispelo"; }
			else if (flagCancelled == 1) { statusOrder = "Preklicano"; }
			else if (flagOrdered == 1) { statusOrder = "Naročeno"; }
			else if (flagRequested == 1) { statusOrder = "Zahtevano"; }
			table.row.add([hits[i].PARTNUMBER, hits[i].PARTNAME, statusOrder, ""]).draw(false);
		}
	});

}
//pregled naročil NOVA
function getNewOrders() {
	var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME FROM narocilo WHERE REQUESTED = 1";
	var row;
	var cell;
	var hits;
	var table = $('.table').DataTable();
	table.clear().draw();
	table.column([3]).visible(true);
	connection.query(query, function (err, results) {
		hits = JSON.parse(JSON.stringify(results));
		for (var i = 0; i < hits.length; i++) {
			table.row.add([hits[i].PARTNUMBER, hits[i].PARTNAME, "Zahtevano", "<button onclick=\"onClickNarocila(this);\" class=\"btn btn-outline-success\">POTRDI</button>", hits[i].ID_ORDER]).draw(false);
		}
	});
}
//pregled naročil NAROČENA KONČANO
function getOrderedOrders() {
	var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME, REQUESTED, ORDERED, ARRIVED, CANCELLED FROM narocilo WHERE ORDERED= 1";
	var row;
	var cell;
	var hits;
	var table = $('.table').DataTable();
	table.clear().draw();
	table.column([3]).visible(true);
	connection.query(query, function (err, results) {
		hits = JSON.parse(JSON.stringify(results));
		for (var i = 0; i < hits.length; i++) {
			table.row.add([hits[i].PARTNUMBER, hits[i].PARTNAME, "Naročeno", "<button onclick=\"onClickNarocila(this);\" class=\"btn btn-outline-success\">POTRDI</button>", hits[i].ID_ORDER]).draw(false);
		}
	});
}
//pregled naročil PREKLICANA KONČANO
function getCancelledOrders() {
	var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME FROM narocilo WHERE CANCELLED = 1";
	var row;
	var cell;
	var hits;
	var table = $('.table').DataTable();
	table.clear().draw();
	table.column([3]).visible(true);
	connection.query(query, function (err, results) {
		hits = JSON.parse(JSON.stringify(results));
		for (var i = 0; i < hits.length; i++) {
			table.row.add([hits[i].PARTNUMBER, hits[i].PARTNAME, "Preklicano", "<button onclick=\"onClickNarocila(this);\" class=\"btn btn-outline-danger\">POTRDI</button>", hits[i].ID_ORDER]).draw(false);
		}
	});
}
//pregled naročil PRISPELA KONČANO
function getArrivedOrders() {
	var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME FROM narocilo WHERE ARRIVED = 1";
	var row;
	var cell;
	var hits;
	var table = $('.table').DataTable();
	table.clear().draw();
	table.column([3]).visible(false);
	connection.query(query, function (err, results) {
		hits = JSON.parse(JSON.stringify(results));
		for (var i = 0; i < hits.length; i++) {
			table.row.add([hits[i].PARTNUMBER, hits[i].PARTNAME, "Prispelo", "<button style=\"display:none\" onclick=\"onClickNarocila(this);\" class=\"btn btn-outline-success\">POTRDI</button>", hits[i].ID_ORDER]).draw(false);
		}
	});
}
//preklopi med stanji naročil NEESSFIX
function onClickNarocila(e) {
	var partnumber, partname, statusOrder, orderID;
	var table = $('.table').DataTable();
	var data = table.row($(e).parents('tr')).data();
	var statusOrder = data[2];
	var orderID = data[4];
	var query;
	switch (statusOrder) {
		case "Preklicano": query = "DELETE FROM narocilo WHERE ID_ORDER = " + orderID; break;
		case "Zahtevano": query = "UPDATE narocilo SET REQUESTED = 0, ORDERED = 1 WHERE ID_ORDER = " + orderID; break;
		case "Naročeno": query = "UPDATE narocilo SET ORDERED = 0, ARRIVED = 1 WHERE ID_ORDER = " + orderID; break;
	}
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			switch (statusOrder) {
				case "Preklicano": getCancelledOrders(); break;
				case "Zahtevano": getNewOrders(); break;
				case "Naročeno": getOrderedOrders(); break;
			}
		}
	});
}

function getUsers() {
	var query = "SELECT ID_USER, USERNAME, PASSWORD, FULL_NAME, SKLADISCNIK FROM uporabnik";
	var hits;
	var table = $('.table').DataTable();
	table.clear().draw();
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			hits = JSON.parse(JSON.stringify(results));
			for (var i = 0; i < hits.length; i++) {
				table.row.add([hits[i].FULL_NAME, hits[i].USERNAME, hits[i].PASSWORD, hits[i].ID_USER, hits[i].SKLADISCNIK, "<button onclick=\"updateUser(this)\" class=\"btn btn-outline-success \">SPREMENI</button>", "<button onclick=\"deleteUser(this)\" class=\"btn btn-outline-danger izbrisi\">IZBRIŠI</button>"]).draw(false);
			}
		}
	});
}

//dodaj uporabnika
function addUserPotrdi() {
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	var fullName = document.getElementById("name").value;
	var skladiscnik = (document.getElementById("skladiscnik").checked) ? 1 : 0;

	// preveri če uporabnik že obstaja
	var query = "SELECT ID_USER, USERNAME, PASSWORD, FULL_NAME, SKLADISCNIK FROM uporabnik WHERE USERNAME = '" + username + "'";
	var hits;
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			hits = JSON.parse(JSON.stringify(results));

			if (hits.length > 0) {
				alert("Uporabnik s tem uporabniškim imenom že obstaja!");
				return;
			}

			var query = "INSERT INTO uporabnik (USERNAME, PASSWORD, FULL_NAME, SKLADISCNIK) values ('" + username + "','" + password + "','" + fullName + "'," + skladiscnik + ")";
			connection.query(query, function (err, results) {
				if (err) { console.log(err); }
				else {
					alert("Uporabnik je uspešno dodan.");
					getUsers();

					document.getElementById("username").value = "";
					document.getElementById("password").value = "";
					document.getElementById("name").value = "";
					document.getElementById("skladiscnik").checked = false;
				}
			});
		}
	});

	// prevent page refresh
	return false;
}

function updateUser(e) {
	var table = $('.table').DataTable();
	var data = table.row($(e).parents('tr')).data();
	selectedID = data[3];
	var modal = $("#myModal").modal();
}

function updateUserPotrdi() {
	var full_name = document.getElementById("spremeniFull_Name").value;
	var username = document.getElementById("spremeniUsername").value;
	var password = document.getElementById("spremeniPassword").value;
	var skladiscnik = (document.getElementById("spremeniSkladiscnik").checked) ? 1 : 0;
	var querySklad = "UPDATE uporabnik SET SKLADISCNIK = " + skladiscnik + " WHERE ID_USER = " + selectedID;
	connection.query(querySklad, function (err, results) { if (err) { console.log(err) } });
	var query;
	if (full_name != "") {
		query = "UPDATE uporabnik SET FULL_NAME = '" + full_name + "' WHERE ID_USER = " + selectedID;
		connection.query(query, function (err, results) { if (err) { console.log(err); } });
	}
	if (username != "") {
		query = "UPDATE uporabnik SET USERNAME = '" + username + "' WHERE ID_USER = " + selectedID;
		connection.query(query, function (err, results) { if (err) { console.log(err); } });
	}
	if (password != "") {
		query = "UPDATE uporabnik SET PASSWORD = '" + password + "' WHERE ID_USER = " + selectedID;
		connection.query(query, function (err, results) { if (err) { console.log(err); } });
	}
	getUsers();
	$('#myModal').modal('hide');
}

//briši uporabnika
function deleteUser(e) {
	if (confirm('Ali res želite izbrisati uporabnika?')) {
		var table = $('.table').DataTable();
		var data = table.row($(e).parents('tr')).data();
		var query = "DELETE FROM uporabnik WHERE ID_USER = " + data[3];
		connection.query(query, function (err, results) {
			if (err) { console.log(err); }
			else {
				getUsers();
			}
		});
	} else {

	}
}

// zaloga skladiščnik KONČANO
function loadItemsFromShramba() {
	var query = "select ID_ITEM, PARTNAME, PARTNUMBER from shramba";
	var hits;
	var row;
	var cell;
	var table = $('.table').DataTable();
	table.clear().draw();
	connection.query(query, function (err, results) {
		if (err) { console.log(err); }
		else {
			hits = JSON.parse(JSON.stringify(results));
			for (var i = 0; i < hits.length; i++) {
				shramba.push({ id: hits[i].ID_ITEM, partName: hits[i].PARTNAME, partNumber: hits[i].PARTNUMBER });
			}
		}

		autocomplete("imeDela");
		autocomplete("stDela");
	});
}

function autocomplete(elementId) {
	var arr;
	var inp;
	var second;

	if (elementId === "imeDela") {
		arr = shramba.map(a => a.partName);
		inp = document.getElementById("imeDela");
		second = document.getElementById("stDela");
	}
	else if (elementId === "stDela") {
		arr = shramba.map(a => a.partNumber);
		inp = document.getElementById("stDela");
		second = document.getElementById("imeDela");
	}

	var currentFocus;
	inp.addEventListener("input", function (e) {
		var a, b, i, val = this.value;
		closeAllLists();
		if (!val) { return false; }
		currentFocus = -1;
		a = document.createElement("DIV");
		a.setAttribute("id", this.id + "autocomplete-list");
		a.setAttribute("class", "autocomplete-items");
		this.parentNode.appendChild(a);
		for (i = 0; i < arr.length; i++) {
			if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
				b = document.createElement("DIV");
				b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
				b.innerHTML += arr[i].substr(val.length);
				b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
				b.addEventListener("click", function (e) {
					inp.value = this.getElementsByTagName("input")[0].value;

					if (elementId === "imeDela") {
						const filtered = shramba.filter(r => r.partName === inp.value)[0];
						second.value = filtered.partNumber;
					}
					else if (elementId === "stDela") {
						const filtered = shramba.filter(r => r.partNumber === inp.value)[0];
						second.value = filtered.partName;
					}

					closeAllLists();
				});
				a.appendChild(b);
			}
		}
	});
	inp.addEventListener("keydown", function (e) {
		var x = document.getElementById(this.id + "autocomplete-list");
		if (x) x = x.getElementsByTagName("div");
		if (e.keyCode == 40) {
			currentFocus++;
			addActive(x);
		} else if (e.keyCode == 38) { //up
			currentFocus--;
			addActive(x);
		} else if (e.keyCode == 13) {
			e.preventDefault();
			if (currentFocus > -1) {
				if (x) x[currentFocus].click();
			}
		}
	});
	function addActive(x) {
		if (!x) return false;
		removeActive(x);
		if (currentFocus >= x.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = (x.length - 1);
		x[currentFocus].classList.add("autocomplete-active");
	}
	function removeActive(x) {
		for (var i = 0; i < x.length; i++) {
			x[i].classList.remove("autocomplete-active");
		}
	}
	function closeAllLists(elmnt) {
		var x = document.getElementsByClassName("autocomplete-items");
		for (var i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != inp) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}

	document.addEventListener("click", function (e) {
		closeAllLists(e.target);
	});
}
