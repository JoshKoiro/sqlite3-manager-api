const sqlite3 = require('sqlite3')  
const Promise = require('bluebird')


class AppDAO {  
  

  constructor(dbFilePath) {
    
      this.db = new sqlite3.Database(dbFilePath, (err) => {
        if (err) {
        console.log('Could not connect to database', err)
        }
    })
  }


  run(sql, params = []) {
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log('Error running sql ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve({ id: this.lastID })
        }
      })
    })
  }


  get(sql, params = []) {
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }


  all(sql, params = []) {
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  
  formatTableRows(columnObject){
    
    return columnObject
      .reduce((sum,e,i) => {
        if(i===0){
          return sum + e.name + ' ' + e.type
        } 
        else {
          return sum + ', ' + e.name + ' ' + e.type
        }
      },'')
  }


  formatInsert(recordObject){
    
    let column = Object.keys(recordObject)
        .reduce((sum,e,i) => {
          if(i===0) {
            return sum + e
          } 
          else {
            return sum + ', ' + e
          }
        },'')
    
    let value = Object.keys(recordObject)
        .reduce((sum,e,i) => {
          if(i===0) {
            return sum + '?'
          } 
          else {
            return sum + ', ?'
          }
        },'')

    return {columnName: column, cellValue: value}
  }

  
  formatUpdate(recordObject){
    
    return Object.keys(recordObject).reduce((sum,e,i) => {
      if(i===0){
        return sum + e + ' = ?'
      } else {
      return sum + ', ' + e + ' = ?'
      }
    },'')
  }


  insertTable(tableName,rows) {
    
    const sql = `CREATE TABLE IF NOT EXISTS ` + tableName + 
    ` (id INTEGER PRIMARY KEY AUTOINCREMENT,` + this.formatTableRows(rows) + `)`
    
    return this.run(sql)
  }


  removeTable(tableName) {
    
    const sql = `DROP TABLE IF EXISTS ` + tableName
    
    return this.run(sql)
  }


  showColumns(tableName) {
    
    const sql = `SELECT sql FROM sqlite_master WHERE name = '` + tableName + `'`
    
    return this.all(sql)
  }


  showTables() {
    
    const sql = `SELECT name FROM sqlite_master WHERE type ='table' AND name NOT LIKE 'sqlite_%'`
    
    return this.all(sql)
  }


  showTable(table) {
    
    const sql = `SELECT * FROM ` + table
    
    return this.all(sql)
  }


  insertRecord(table,record){
    
    const columnNames = this.formatInsert(record).columnName
    
    const cellValues = this.formatInsert(record).cellValue
    
    return this.run(`INSERT INTO ` + table + ` (` + columnNames + `) VALUES (` + cellValues + `)`
    ,Object.keys(record)
      .map((e) => record[e]))
  }


  updateRecord(table,id,values){
    
    const cols = this.formatUpdate(values)
    
    return this.run(`UPDATE ` + table + ` SET ` + cols + ` WHERE id = ` + id
    ,Object.keys(values)
      .map((e) => values[e])
    )
  }


  deleteRecord(table,value){
    
    return this.run(`DELETE FROM ` + table + ` WHERE id = ` + value)
  }

}


module.exports = AppDAO  