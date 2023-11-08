import mysql from 'mysql';

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin12345",
    database: "employeems"
});

con.connect(function(err) {
    if(err) {
        console.log("connection error");
    } else {
        console.log("Connected");
    }
})

export default con;