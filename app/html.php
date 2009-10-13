<?php

/**
 * PHP REST SQL HTML renderer class
 * This class renders the REST response data as HTML.
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
        header('Content-Type: text/html');
        echo '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Strict//EN">'."\n";
        echo '<html>'."\n";
        echo '<head>'."\n";
        echo '<title>PHP REST SQL : Database "'.htmlspecialchars($this->PHPRestSQL->config['database']['database']).'"</title>'."\n";
        echo '</head>'."\n";
        echo '<body>'."\n";
        echo '<h1>Tables in database "'.htmlspecialchars($this->PHPRestSQL->config['database']['database']).'"</h1>'."\n";
        if (isset($this->PHPRestSQL->output['database'])) {
            echo '<ul>'."\n";
            foreach ($this->PHPRestSQL->output['database'] as $table) {
                echo '<li><a href="'.htmlspecialchars($table['xlink']).'">'.htmlspecialchars($table['value']).'</a></li>'."\n";
            }
            echo '</ul>'."\n";
        }
        echo '</body>'."\n";
        echo '</html>'."\n";
    }
    
    /**
     * Output the rows within a table.
     */
    function table() {
        header('Content-Type: text/html');
        echo '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Strict//EN">'."\n";
        echo '<html>'."\n";
        echo '<head>'."\n";
        echo '<title>PHP REST SQL : Table "'.htmlspecialchars($this->PHPRestSQL->table).'"</title>'."\n";
        echo '</head>'."\n";
        echo '<body>'."\n";
        echo '<h1>Records in table "'.htmlspecialchars($this->PHPRestSQL->table).'"</h1>'."\n";
        if (isset($this->PHPRestSQL->output['table'])) {
            echo '<ul>'."\n";
            foreach ($this->PHPRestSQL->output['table'] as $row) {
                echo '<li><a href="'.htmlspecialchars($row['xlink']).'">'.htmlspecialchars($row['value']).'</a></li>'."\n";
            }
            echo '</ul>'."\n";
        }
        echo '</body>'."\n";
        echo '</html>'."\n";
    }
    
    /**
     * Output the entry in a table row.
     */
    function row() {
        header('Content-Type: text/html');
        echo '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Strict//EN">'."\n";
        echo '<html>'."\n";
        echo '<head>'."\n";
        echo '<title>PHP REST SQL : Record #'.htmlspecialchars(join('/', $this->PHPRestSQL->uid)).'</title>'."\n";
        echo '</head>'."\n";
        echo '<body>'."\n";
        echo '<h1>Record #'.htmlspecialchars(join('/', $this->PHPRestSQL->uid)).'</h1>'."\n";
        if (isset($this->PHPRestSQL->output['row'])) {
            echo '<table>'."\n";
            foreach ($this->PHPRestSQL->output['row'] as $field) {
                echo '<tr>'."\n";
				echo '<th>'.htmlspecialchars($field['field']).'</th>'."\n";
				echo '<td>'."\n";
                if (isset($field['xlink'])) {
                    echo '<a href="'.htmlspecialchars($field['xlink']).'">'.htmlspecialchars($field['value']).'</a>'."\n";
                } else {
                    echo htmlspecialchars($field['value'])."\n";
                }
                echo '</td>'."\n";
				echo '</tr>'."\n";
            }
            echo '</table>'."\n";
        }
        echo '</body>'."\n";
        echo '</html>'."\n";
    }

}
