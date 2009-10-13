<?php

/**
 * PHP REST SQL plain text renderer class
 * This class renders the REST response data as plain text.
 */
class PHPRestSQLRenderer {
   
    /**
     * @var PHPRestSQL PHPRestSQL
     */
    var $PHPRestSQL;
   
    /**
     * Constructor. Takes an output array and calls the appropriate handler.
     * @param PHPRestSQL PHPRestSQL
     */
    function render($PHPRestSQL) {
        $this->PHPRestSQL = $PHPRestSQL;
        switch($PHPRestSQL->display) {
            case 'database':
                $this->database();
                break;
            case 'table':
                $this->table();
                break;
            case 'row':
                $this->row();
                break;
        }
    }

    
    /**
     * Output the top level table listing.
     */
    function database() {
        header('Content-Type: text/plain');
        if (isset($this->PHPRestSQL->output['database'])) {
            foreach ($this->PHPRestSQL->output['database'] as $table) {
                echo $table['value'].'['.$table['xlink']."]\n";
            }
        }
    }
    
    /**
     * Output the rows within a table.
     */
    function table() {
        header('Content-Type: text/plain');
        if (isset($this->PHPRestSQL->output['table'])) {
            foreach ($this->PHPRestSQL->output['table'] as $row) {
                echo $row['value'].'['.$row['xlink']."]\n";
            }
        }
    }
    
    /**
     * Output the entry in a table row.
     */
    function row() {
        header('Content-Type: text/plain');
        if (isset($this->PHPRestSQL->output['row'])) {
            foreach ($this->PHPRestSQL->output['row'] as $field) {
                echo $field['field'].'='.$field['value'];
                if (isset($field['xlink'])) {
                    echo '['.$field['xlink'].']';
                }
                echo "\n";
            }
        }
    }

}
