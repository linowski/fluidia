<?php
/* $id$ */

require_once("MDB2.php");

/**
 * PHP REST MySQL class
 * MySQL connection class.
 */
class mysql {
    
    /**
     * @var resource resource
     */
    var $db;
    
    /**
     * Connect to the database.
     * @param str[] config
     */
	function connect($config) {
		
		if (isset($config['dsn'])) {
			$dsn = $config['dsn'];
		} else {
			$dsn = array(
				'phptype' => $config['phptype'],
				'hostspec' => $config['hostspec'],
				'username' => $config['username'],
				'password' => $config['password'],
				'database' => $config['database']
			);
		}
        
		$options = array(
            'debug' => 0,
            'portability' => MDB2_PORTABILITY_ALL
        );
		
        $this->db =& MDB2::connect($dsn, $options);
		
        if (PEAR::isError($this->db)) {
            return FALSE;
        }
		
        $this->manager =& $this->db->loadModule('Manager', NULL, TRUE);
        $this->reverse =& $this->db->loadModule('Reverse', NULL, TRUE);
		
		return TRUE;
    }

	
    /**
     * Close the database connection.
     */
    function close() {
		$this->db->disconnect();
    }
    
    /**
     * Get the columns in a table.
     * @param str table
     * @return resource A resultset resource
     */
    function getColumns($table) {
        return mysql_query(sprintf('SHOW COLUMNS FROM %s', $table), $this->db);
    }
    
    /**
     * Get a row from a table.
     * @param str table
     * @param str where
     * @return resource A resultset resource
     */
    function getRow($table, $where) {
        return mysql_query(sprintf('SELECT * FROM %s WHERE %s', $table, $where));
    }
    
    /**
     * Get the rows in a table.
     * @param str primary The names of the primary columns to return
     * @param str table
     * @return resource A resultset resource
     */
    function getTable($primary, $table) {
        return mysql_query(sprintf('SELECT %s FROM %s', $primary, $table));
    }

    /**
     * Get the tables in a database.
     * @return resource A resultset resource
     */
    function getDatabase() {
        return mysql_query('SHOW TABLES');
    }
    
    /**
     * Update a row.
     * @param str table
     * @param str values
     * @param str where
     * @return bool
     */
    function updateRow($table, $values, $where) {
        return mysql_query(sprintf('UPDATE %s SET %s WHERE %s', $table, $values, $where));
    }
    
    /**
     * Insert a new row.
     * @param str table
     * @param str names
     * @param str values
     * @return bool
     */
    function insertRow($table, $names, $values) {
        return mysql_query(sprintf('INSERT INTO %s (`%s`) VALUES ("%s")', $table, $names, $values));
    }
    
    /**
     * Get the columns in a table.
     * @param str table
     * @return resource A resultset resource
     */
    function deleteRow($table, $where) {
        return mysql_query(sprintf('DELETE FROM %s WHERE %s', $table, $where));
    }
    
    /**
     * Escape a string to be part of the database query.
     * @param str string The string to escape
     * @return str The escaped string
     */
    function escape($string) {
        return mysql_escape_string($string);
    }
    
    /**
     * Fetch a row from a query resultset.
     * @param resource resource A resultset resource
     * @return str[] An array of the fields and values from the next row in the resultset
     */
    function row($resource) {
        return mysql_fetch_assoc($resource);
    }

    /**
     * The number of rows in a resultset.
     * @param resource resource A resultset resource
     * @return int The number of rows
     */
    function numRows($resource) {
        return mysql_num_rows($resource);
    }

    /**
     * The number of rows affected by a query.
     * @return int The number of rows
     */
    function numAffected() {
        return mysql_affected_rows($this->db);
    }
    
    /**
     * Get the ID of the last inserted record. 
     * @return int The last insert ID
     */
    function lastInsertId() {
        return mysql_insert_id();
    }
    
}
?>
