<?php

/**
 * PHP REST SQL XML renderer class
 * This class renders the REST response data as XML.
 */
class PHPRestSQLRenderer {
   
    /**
     * @var PHPRestSQL PHPRestSQL
     */
    var $PHPRestSQL;
   
    /**
     * Constructor.
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
        header('Content-Type: text/xml');
        echo '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        echo '<database xmlns:xlink="http://www.w3.org/1999/xlink">'."\n";
        if (isset($this->PHPRestSQL->output['database'])) {
            foreach ($this->PHPRestSQL->output['database'] as $table) {
                echo "\t".'<table xlink:href="'.htmlspecialchars($table['xlink']).'">'.htmlspecialchars($table['value']).'</table>'."\n";
            }
        }
        echo '</database>';
    }
    
    /**
     * Output the rows within a table.
     */
    function table() {
        header('Content-Type: text/xml');
        echo '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        echo '<table xmlns:xlink="http://www.w3.org/1999/xlink">'."\n";
        if (isset($this->PHPRestSQL->output['table'])) {
            foreach ($this->PHPRestSQL->output['table'] as $row) {
                echo "\t".'<row xlink:href="'.htmlspecialchars($row['xlink']).'">'.htmlspecialchars($row['value']).'</row>'."\n";
            }
        }
        echo '</table>'; 
    }
    
    /**
     * Output the entry in a table row.
     */
    function row() {
        header('Content-Type: text/xml');
        echo '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        echo '<row xmlns:xlink="http://www.w3.org/1999/xlink">'."\n";
        if (isset($this->PHPRestSQL->output['row'])) {
            foreach ($this->PHPRestSQL->output['row'] as $field) {
                $fieldName = $field['field'];
                echo "\t".'<'.$fieldName;
                if (isset($field['xlink'])) {
                    echo ' xlink:href="'.htmlspecialchars($field['xlink']).'"';
                }
                echo '>'.htmlspecialchars($field['value']).'</'.$fieldName.'>'."\n";
            }
        }
        echo '</row>';
    }

}
