const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: 'root',
        database: 'employees_db'
    },
    console.log(`Connected to the employees_db database.`)
);


// Prompt for user action
inquirer
    .prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit', // Include an option to exit the application
        ],
    })
    .then((answer) => {
        // Call the appropriate function based on the user's choice
        switch (answer.action) {
            case 'View all departments':
                // Query database
                db.query(`SELECT * FROM department`, function (err, results) {
                    console.table(results);
                });
                break;
            case 'View all roles':
                // Query database
                db.query(`SELECT role.id, role.title,department.name AS department, role.salary
                FROM role
                INNER JOIN department on role.department_id = department.id
                ORDER BY role.id`, function (err, results) {
                    console.table(results);
                });
                break;
            case 'View all employees':
                // Query database
                db.query(`SELECT
                e.id, 
                e.first_name,
                e.last_name, 
                r.title,
                d.name AS department, 
                r.salary, 
                CONCAT(m.first_name, ' ', m.last_name) AS manager
                FROM employees e
                INNER JOIN role r ON e.role_id = r.id
                INNER JOIN department d ON r.department_id = d.id
                LEFT JOIN employees m ON e.manager_id = m.id
                ORDER BY e.id`, function (err, results) {
                    console.table(results);
                });
                break;
            case 'Add a department':
                // Call a function to add a department
                break;
            case 'Add a role':
                // Call a function to add a role
                break;
            case 'Add an employee':
                // Call a function to add an employee
                break;
            case 'Update an employee role':
                // Call a function to update an employee role
                break;
            case 'Exit':
                console.log('Exiting the application');
                break;
            default:
                console.log('Invalid choice. Please try again.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });