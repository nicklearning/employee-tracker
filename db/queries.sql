USE employees_db;
-- View all departments
SELECT *
FROM department; 

-- View all roles
SELECT role.id, role.title, department.name AS department, role.salary
FROM role
INNER JOIN department on role.department_id = department.id
ORDER BY role.id;

-- View all employees
SELECT
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
ORDER BY e.id;