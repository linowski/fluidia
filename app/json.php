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
            case 'struct':
                $this->struct();
                break;
        }
    }

    
    /**
     * Output the top level table listing.
     */
    function struct() {
        header('Content-Type: text/json');
        if (isset($this->PHPRestSQL->output['struct'])) {
	   echo json_encode($this->PHPRestSQL->output['struct']);
	}
    }

    /**
     * Output the top level table listing.
     */
    function database() {
        header('Content-Type: text/json');
        if (isset($this->PHPRestSQL->output['database'])) {
            foreach ($this->PHPRestSQL->output['database'] as $table) {
                $output[] = $table['value'].'['.$table['xlink']."]";
            }
        }
	//var_dump($output);
	echo json_encode($output);
    }
    
    /**
     * Output the rows within a table.
     */
    function table() {
        header('Content-Type: text/json');
        if (isset($this->PHPRestSQL->output['table'])) {
            foreach ($this->PHPRestSQL->output['table'] as $row) {
                $output[] = $row['value'].'['.$row['xlink']."]";
            }
        }
	//var_dump($output);
	echo json_encode($output);
    }
    
    /**
     * Output the entry in a table row.
     */
    function row() {
        header('Content-Type: text/json');
        if (isset($this->PHPRestSQL->output['row'])) {
	    $i = 0;
            foreach ($this->PHPRestSQL->output['row'] as $field) {
                $output[$i] = $field['field'].'='.$field['value'];
                if (isset($field['xlink'])) {
                    $output[$i][] = '['.$field['xlink'].']';
                }
	       $i++;
            }
        }
	//var_dump($output);
	echo json_encode($output);
    }

}
