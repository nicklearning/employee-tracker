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

// Function to perform database query and return a promise
function performQuery(sql) {
    return new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Prompt for user action
async function handleUserPrompts() {
    let keepPrompting = true;

    while (keepPrompting) {
        await inquirer
            .prompt({
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View All Departments',
                    'View All Roles',
                    'View All Employees',
                    'Add Department',
                    'Add Role',
                    'Add Employee',
                    'Update Employee Role',
                    'Quit', // Include an option to exit the application
                ],
            })
            .then(async (answer) => {
                // Call the appropriate function based on the user's choice
                switch (answer.action) {
                    case 'View All Departments':
                        // Query database
                        const departmentResults = await performQuery(`SELECT * FROM department`);
                        console.log('\n');
                        console.table(departmentResults);
                        keepPrompting = true;
                        break;
                    case 'View All Roles':
                        // Query database
                        const roleResults = await performQuery(`SELECT role.id, role.title,department.name AS department, role.salary
                        FROM role
                        INNER JOIN department on role.department_id = department.id
                        ORDER BY role.id`);
                        console.log('\n');
                        console.table(roleResults);
                        keepPrompting = true;
                        break;
                    case 'View All Employees':
                        // Query database
                        const employeeResults = await performQuery(`SELECT
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
                        ORDER BY e.id`);
                        console.log('\n');
                        console.table(employeeResults);
                        keepPrompting = true;
                        break;
                    case 'Add Department':
                        // Set a flag to prevent further prompting until the department is added
                        let addDepartmentFlag = true;

                        while (addDepartmentFlag) {
                            // Call a function to add a department
                            await inquirer.prompt({
                                type: 'input',
                                name: 'newDepartment',
                                message: 'What is the name of the department?'
                            })
                                .then(async (answer) => {
                                    const newDepartmentName = answer.newDepartment;
                                    try {
                                        // Perform the database query using await
                                        await performQuery(`INSERT INTO department (name) VALUES ('${newDepartmentName}')`);
                                        console.log(`Added ${newDepartmentName} to the Database\n`);
                                        // Set addDepartmentFlag to false to allow further prompts
                                        addDepartmentFlag = false;
                                    } catch (error) {
                                        console.error('Error adding department:', error);
                                    }
                                });
                        }
                        break;
                    case 'Add Role':
                        // Call a function to add a role
                        // Set a flag to prevent further prompting until the department is added
                        let addRoleFlag = true;

                        while (addRoleFlag) {
                            // Fetch department names from the database
                            const departmentChoices = await performQuery('SELECT id, name FROM department');
                            const departmentNames = departmentChoices.map(department => department.name);

                            // Prompt for role details
                            const roleAnswers = await inquirer.prompt([
                                {
                                    type: 'input',
                                    name: 'newRole',
                                    message: 'What is the name of the role?'
                                },
                                {
                                    type: 'number',
                                    name: 'newRoleSalary',
                                    message: 'What is the salary of the role?'
                                },
                                {
                                    type: 'list',
                                    name: 'selectedDepartment',
                                    message: 'What department does the role belong too?',
                                    choices: departmentNames
                                }
                            ]);

                            const { newRole, newRoleSalary, selectedDepartment } = roleAnswers;

                            // Find the corresponding department ID based on the selected department name
                            const selectedDepartmentId = departmentChoices.find(department => department.name === selectedDepartment).id;

                            try {
                                // Perform the database query to insert a new role
                                await performQuery(`INSERT INTO role (title, salary, department_id) VALUES ('${newRole}', ${newRoleSalary}, ${selectedDepartmentId})`);
                                console.log(`Added ${newRole} to the Database\n`);
                                // Set addRoleFlag to false to allow further prompts
                                addRoleFlag = false;
                            } catch (error) {
                                console.error('Error adding role:', error);
                            }
                        }
                        break;
                    case 'Add Employee':
                        // Call a function to add an employee
                        let addEmployeeFlag = true;

                        while (addEmployeeFlag) {

                            const roleChoices = await performQuery('SELECT id, title FROM role');
                            const roleNames = roleChoices.map(role => role.title);

                            const managerChoices = await performQuery('SELECT id, first_name, last_name FROM employees');
                            const managerNames = managerChoices.map(manager => manager.first_name + ' ' + manager.last_name);


                            const employeeAnswers = await inquirer.prompt([
                                {
                                    type: 'input',
                                    name: 'firstName',
                                    message: 'What is the employee\'s first name?'
                                },
                                {
                                    type: 'input',
                                    name: 'lastName',
                                    message: 'What is the employee\'s last name?'
                                },
                                {
                                    type: 'list',
                                    name: 'selectedRole',
                                    message: 'What is the employee\'s role?',
                                    choices: roleNames
                                },
                                {
                                    type: 'list',
                                    name: 'selectedManager',
                                    message: 'Who is the employee\'s manager?',
                                    choices: managerNames
                                }
                            ]);

                            const { firstName, lastName, selectedRole, selectedManager } = employeeAnswers;


                            // Find the corresponding role ID based on the selected role name
                            const selectedRoleId = roleChoices.find(role => role.title === selectedRole).id;
                            // Find the corresponding manager ID based on the selected manager name
                            const selectedManagerId = managerChoices.find(manager => manager.first_name + ' ' + manager.last_name === selectedManager).id;

                            try {
                                // Perform the database query to insert a new role
                                await performQuery(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}', ${selectedRoleId}, ${selectedManagerId})`);
                                console.log(`Added ${firstName} ${lastName} to the Database\n`);
                                // Set addRoleFlag to false to allow further prompts
                                addEmployeeFlag = false;
                            } catch (error) {
                                console.error('Error adding employee:', error);
                            }
                        }
                        break;
                    case 'Update Employee Role':

                        let updateEmployeeFlag = true;

                        while (updateEmployeeFlag) {

                            // Call a function to update an employee role
                            // Fetch employee names from the database
                            const employeeChoices = await performQuery('SELECT id, first_name, last_name FROM employees');
                            const employeeNames = employeeChoices.map(employee => employee.first_name + ' ' + employee.last_name);

                            const roleChoices = await performQuery('SELECT id, title FROM role');
                            const roleTitles = roleChoices.map(role => role.title);

                            // Prompt for employee details
                            const employeeAnswers = await inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'selectedEmployee',
                                    message: 'Which employee\'s role do you want to update?',
                                    choices: employeeNames
                                },
                                {
                                    type: 'list',
                                    name: 'selectedRole',
                                    message: 'Which role do you want to assign to the selected employee?',
                                    choices: roleTitles
                                }]
                            )

                            const { selectedEmployee, selectedRole } = employeeAnswers;
                            // Find the corresponding role ID based on the selected role name
                            const selectedEmployeeId = employeeChoices.find(employee => employee.first_name + ' ' + employee.last_name === selectedEmployee).id;
                            const selectedRoleID = roleChoices.find(role => role.title === selectedRole).id;

                            try {
                                // Perform the database query to update an employee's role
                                await performQuery(`UPDATE employees SET role_id = ${selectedRoleID} WHERE id = ${selectedEmployeeId};`);
                                console.log(`Updated employee's role\n`);
                                // Set addRoleFlag to false to allow further prompts
                                updateEmployeeFlag = false;
                            } catch (error) {
                                console.error('Error updating employee:', error);
                            }
                        }
                        break;
                    case 'Quit':
                        console.log('Exiting the application');
                        keepPrompting = false;
                        break;
                    default:
                        console.log('Invalid choice. Please try again.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
}

// Initial Prompt
handleUserPrompts();