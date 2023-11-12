const db = require("../database/db");

module.exports = class Employee{

    constructor(name, email, password){
        this.name = name;
        this.email = email;
        this.password = password;
    }

    
    static async createEmployee(
        name,
        email,
        password,
      ) {
        return await db.execute(
          "INSERT INTO employees(name, email, hashed_password) VALUES (?, ?, ?)",
          [name, email, password]
        );
      }

      static async checkDuplicateEmail(email) {
        try {
          const [rows] = await db.execute("SELECT * FROM employees WHERE email = ?", [
            email,
          ]);
          db.releaseConnection();
          return rows.length > 0;
        } catch (error) {
          console.error(error);
          return false;
        }
      }

      static async authenticateUser(email) {
        return await db.execute("SELECT * FROM employees WHERE email = ?", [email]);
      }

      static async findByID(userId){
        try{
          const [rows] = await db.execute('SELECT * FROM employees WHERE id = ?', [userId]);
          db.releaseConnection();
          if (rows.length > 0) {
            const user = rows[0];
            console.log(user);
            return user;
          }
    
          return null;
        
        }catch (error) {
          throw new Error('Error fetching user');
        }
      }

      static async updateProfilePicture(userId, fileName) {
        try {
          const query = 'UPDATE employees SET profile_picture = ? WHERE id = ?';
          const [result] = await db.execute(query, [fileName, userId]);
          db.releaseConnection();
          return result;
        } catch (error) {
          console.error('Error updating profile picture:', error);
          throw error;
        }
      }

      
  static async findById(employeeId) {
    try {
      const query = 'SELECT profile_picture FROM employees WHERE id = ?';
      const [rows] = await db.execute(query, [employeeId]);
      db.releaseConnection();
      return rows[0];
    } catch (error) {
      console.error('Error retrieving employee by ID:', error);
      throw error;
    }
  }

  static async searchUsers(query) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM employees WHERE name LIKE ?',
        [`%${query}%`]
      );
      db.releaseConnection();
      return rows;
    } catch (error) {
      throw error;
    }
  }
}