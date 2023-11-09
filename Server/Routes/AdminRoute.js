import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

const router = express.Router();

// Login for admins

router.post('/adminlogin', (req, res) => {
    const sql = "SELECT * FROM admin WHERE email = ? and password = ?";
    con.query(sql, [req.body.email, req.body.password], (err, result) => {
        if (err) return res.json({ loginStatus: false, Error: "Query error" })
        if (result.length > 0) {
            const email = result[0].email;
            const token = jwt.sign(
                { role: "admin", email: email, id: result[0].id },
                "jwt_secret_key",
                { expiresIn: "1d" }

            );
            res.cookie('token', token);
            return res.json({ loginStatus: true });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" })
        }
    });
});

// Getting the departments in the company

router.get('/category', (req, res) => {
    const sql = "SELECT * FROM category";
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query error" })
        return res.json({ Status: true, Result: result })
    });
});

// Adding the departments in the company

router.post('/add_category', (req, res) => {
    const sql = "INSERT INTO category (`name`) VALUES (?)";
    con.query(sql, [req.body.category], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query error" })
        return res.json({ Status: true })
    });
});

// Image upload and storage destination
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

// End of image upload

// Adding employees into the system

router.post('/add_employee', upload.single('image'), (req, res) => {
    const sql = `INSERT INTO employee
    (name, email, password, address, salary, image, category_id)
    VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Query error" })
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.address,
            req.body.salary,
            req.file.filename,
            req.body.category_id
        ]
        con.query(sql, [values], (err, result) => {
            if (err) return res.json({ Status: false, Error: "Query error" })
            return res.json({ Status: true })
        })
    })
});

// Getting all the employees in the company

router.get('/employee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query error" })
        return res.json({ Status: true, Result: result })
    });
});

// Getting one employee information

router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT * FROM employee
        WHERE id = ?`;
    con.query(sql, [id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" })
        return res.json({ Status: true, Result: result })
    });
});

// Editing employee details

router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE employee 
        SET name = ?, email = ?, salary = ?, address = ?, category_id = ? 
        WHERE id = ?`;
    const values = [
        req.body.name,
        req.body.email,
        req.body.salary,
        req.body.address,
        req.body.category_id
    ]
    con.query(sql, [...values, id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" + err })
        return res.json({ Status: true, Result: result })
    });
});

// Deleting employees records from the system

router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM employee WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" + err })
        return res.json({ Status: true, Result: result })
    });
});

// Return total number of admins in the company

router.get('/admin_count', (req, res) => {
    const sql = "SELECT COUNT(id) AS admin FROM admin";
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" + err })
        return res.json({ Status: true, Result: result })
    });
});
// Return total number of employees in the company

router.get('/employee_count', (req, res) => {
    const sql = "SELECT COUNT(id) AS employee FROM employee";
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" + err })
        return res.json({ Status: true, Result: result })
    });
});

// Return total salaries for the company

router.get('/salary_count', (req, res) => {
    const sql = "SELECT SUM(salary) AS salary FROM employee";
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" + err })
        return res.json({ Status: true, Result: result })
    });
});

// Return admin information

router.get('/admin_records', (req, res) => {
    const sql = "SELECT * FROM admin";
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" + err })
        return res.json({ Status: true, Result: result })
    });
});

// Logout of the system and remove token from cookies

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: true })
});

export { router as AdminRouter }